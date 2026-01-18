const crypto = require('crypto');

// Simple math rendering function (placeholder)
function renderMath(content) {
  // This is a simplified version - in production, you'd use MathJax Node
  const mathRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  const formulas = [];
  
  const rendered = content.replace(mathRegex, (match, blockMath, inlineMath) => {
    const math = blockMath || inlineMath;
    const hash = crypto.createHash('md5').update(math).digest('hex');
    formulas.push({ math, hash });
    
    // Return a placeholder for the math
    return `<span class="math-placeholder" data-hash="${hash}">${math}</span>`;
  });
  
  return {
    content: rendered,
    formulas: formulas.length
  };
}

module.exports = { renderMath };