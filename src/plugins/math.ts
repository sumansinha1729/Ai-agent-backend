export function mathplugin(expr:string): string {
    try {
        const sanitized=expr.replace(/[^-()\d*+.]/g, '');

        return eval(sanitized).toString();
    } catch (error) {
        return "Error evaluating math expression.";
    }
}