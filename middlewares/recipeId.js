const recipeIdGen = () => {
    const prefix = 'RC-';
    const random = Math.random().toString(36).toUpperCase();
    return prefix + random;
}

module.exports = recipeIdGen;