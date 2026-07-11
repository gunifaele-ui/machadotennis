export const validateSetInput = (val) => {
    let num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return 0;
    if (num > 99) return 99;
    return num;
};
