export const conferirSuperTieCompleto = (a, b) => {
    if (a >= 10 && (a - b) >= 2) return true;
    if (b >= 10 && (b - a) >= 2) return true;
    return false;
};
