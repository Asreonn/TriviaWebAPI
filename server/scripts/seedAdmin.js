import '../src/config/index.js';
import { connectDatabase, disconnectDatabase } from '../src/utils/database.js';
import { logger } from '../src/utils/logger.js';
import { AdminRepository } from '../src/repositories/adminRepository.js';
import { hashPassword } from '../src/services/authService.js';

const parseArgs = () => {
    const args = process.argv.slice(2);
    const result = {};
    let currentKey = null;

    for (const arg of args) {
        if (arg.startsWith('--')) {
            currentKey = arg.replace(/^--/, '');
            result[currentKey] = true;
        } else if (currentKey) {
            if (result[currentKey] === true) {
                result[currentKey] = arg;
            } else if (Array.isArray(result[currentKey])) {
                result[currentKey].push(arg);
            } else {
                result[currentKey] = [result[currentKey], arg];
            }
        }
    }

    if (typeof result.permissions === 'string') {
        result.permissions = result.permissions.split(',').map((p) => p.trim());
    }

    return result;
};

const validate = (options) => {
    const required = ['username', 'password', 'displayName'];
    const missing = required.filter((key) => !options[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required options: ${missing.join(', ')}`);
    }

    ['permissions', 'roles'].forEach((field) => {
        if (options[field] === true) {
            throw new Error(`Option --${field} requires at least one value`);
        }
    });
};

const run = async () => {
    try {
        const options = parseArgs();
        validate(options);

        await connectDatabase();

        const existing = await AdminRepository.findByUsername(options.username);

        if (existing) {
            logger.info({ username: options.username }, 'Admin already exists, updating record');
            const attributes = {
                permissions: options.permissions ?? existing.permissions,
            };

            if (options.roles) {
                attributes.roles = Array.isArray(options.roles)
                    ? options.roles
                    : options.roles.split(',').map((role) => role.trim());
            }

            if (options.displayName) {
                attributes.displayName = options.displayName;
            }

            const updated = await AdminRepository.updateAttributes(existing.id, attributes);
            logger.info({ id: updated.id }, 'Admin record updated');
        } else {
            const passwordHash = await hashPassword(options.password);
            const admin = await AdminRepository.create({
                username: options.username,
                passwordHash,
                displayName: options.displayName,
                roles: options.roles
                    ? Array.isArray(options.roles)
                        ? options.roles
                        : options.roles.split(',').map((role) => role.trim())
                    : ['admin'],
                permissions: options.permissions ?? [
                    'view_stats',
                    'view_pending_quizzes',
                    'approve_quizzes',
                    'reject_quizzes',
                ],
            });
            logger.info({ id: admin.id }, 'Admin created successfully');
        }

        process.exit(0);
    } catch (error) {
        logger.error({ err: error }, 'Failed to seed admin user');
        console.error(error.message);
        process.exit(1);
    } finally {
        await disconnectDatabase();
    }
};

run();
