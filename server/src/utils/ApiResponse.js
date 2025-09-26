export class ApiResponse {
    constructor({ success = true, message = '', data = null, errors = undefined, traceId = undefined }) {
        this.success = success;
        this.message = message;
        this.data = data;
        if (errors && errors.length > 0) {
            this.errors = errors;
        }
        if (traceId) {
            this.traceId = traceId;
        }
    }
}
