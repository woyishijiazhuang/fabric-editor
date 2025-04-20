export const validateNumber = (rule: any, value: any, callback: any) => {
    if (!/^\d+$/.test(value)) {
        callback(new Error("必须为数字"));
    } else {
        callback();
    }
};

export const validateRange = (min: number, max: number) => {
    return (rule: any, value: any, callback: any) => {
        const numValue = parseInt(value, 10);
        if (numValue < min || numValue > max) {
            callback(new Error(`数值应在 ${min} 到 ${max} 之间`));
        } else {
            callback();
        }
    };
};