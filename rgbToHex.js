function rgbToHex(r, g, b) {
  // Validate the input
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new Error('Invalid RGB values. Values must be between 0 and 255.');
  }

  // Convert each component to a two-digit hexadecimal string
  var hexR = r.toString(16).padStart(2, '0');
  var hexG = g.toString(16).padStart(2, '0');
  var hexB = b.toString(16).padStart(2, '0');

  // Concatenate the components to form the hex color code
  var hexColor = '#' + hexR + hexG + hexB;

  return hexColor;
}

module.exports = rgbToHex;