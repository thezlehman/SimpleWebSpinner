# Spinny McSpinface's Decision Maker 3000

A fun and interactive spinning wheel application for making random selections. Perfect for choosing names, making decisions, or picking winners!

## Features

### Core Functionality
- **Interactive Wheel**: Click the wheel or hit the SPIN button to spin
- **Customizable Names**: Add unlimited names (one per line)
- **Save/Load**: Save your wheel configurations as `.zachscoolformat` files
- **Winner Selection**: Visual and audio feedback when a winner is selected

### During Spin Options
- **Display Duplicates**: Toggle whether duplicate names appear on the wheel
- **Spin Slowly**: Double the spin duration for dramatic effect
- **Show Title**: Display a custom title above the wheel
- **Spin Time**: Adjust spin duration from 1-60 seconds
- **Max Names Visible**: Limit how many names display on the wheel (4-1000)

### After Spin Options
- **Remove Winner**: Automatically remove the winner from the list
- **Play Sound**: Victory sound effect when winner is announced
- **Show Confetti**: Celebratory confetti animation on win

### Appearance Options
- **Dark Mode**: Toggle dark mode (coming soon)
- **Show Borders**: Toggle segment borders on/off
- **Wheel Title**: Add a custom title to your wheel

## Getting Started

### Installation

1. Clone this repository:
```bash
git clone https://github.com/thezlehman/spinner.git
cd spinner
```

2. Open `index.html` in your web browser - that's it! No build process required.

### Usage

1. **Add Names**: Type names into the text area (one per line)
2. **Update Wheel**: Click "Update Wheel" to apply changes
3. **Customize**: Click "Options" to expand settings and customize behavior
4. **Spin**: Click the wheel or SPIN button to make a selection
5. **Save**: Click "Save Wheel" to download your configuration
6. **Load**: Click "Load Wheel" to restore a saved configuration

## File Format

The `.zachscoolformat` file is a JSON file containing:
- List of names
- All option settings (checkboxes, sliders)
- Wheel title

Example:
```json
{
  "names": ["Alice", "Bob", "Charlie"],
  "spinDuration": "10",
  "showTitle": true,
  "wheelTitle": "Team Picker",
  "removeWinner": false,
  "playSound": true,
  "confetti": true
}
```

## Technologies Used

- **HTML5 Canvas**: For rendering the spinning wheel
- **Vanilla JavaScript**: No frameworks, pure JS
- **CSS3**: Animations and styling
- **Canvas Confetti**: Confetti effects ([canvas-confetti](https://github.com/catdad/canvas-confetti))
- **Mixkit**: Free sound effects

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Note: Some browsers may block autoplay audio on first visit. User interaction will enable sounds.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

**Zachary Lehman**
- GitHub: [@thezlehman](https://github.com/thezlehman)

## Acknowledgments

- Sound effects from [Mixkit](https://mixkit.co/)
- Confetti library by [catdad](https://github.com/catdad/canvas-confetti)
- Inspired by wheelofnames.com

---

Made while yelling at the Evil Monkey in my closet
