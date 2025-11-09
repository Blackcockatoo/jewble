#!/usr/bin/env python3
"""
Convert SVG templates to PNG files for the Meta-Pet mobile app.
Requires: pip install cairosvg pillow
"""

import os
from pathlib import Path

try:
    import cairosvg
    from PIL import Image
    import io
except ImportError:
    print("Installing required packages...")
    os.system("pip install cairosvg pillow")
    import cairosvg
    from PIL import Image
    import io

def convert_svg_to_png(svg_path, png_path, width, height):
    """Convert SVG file to PNG with specified dimensions."""
    print(f"Converting {svg_path} to {png_path} ({width}x{height})...")
    
    # Convert SVG to PNG using cairosvg
    png_data = cairosvg.svg2png(
        url=str(svg_path),
        output_width=width,
        output_height=height
    )
    
    # Save the PNG file
    with open(png_path, 'wb') as f:
        f.write(png_data)
    
    print(f"✓ {png_path.name} created")

def main():
    # Get the assets directory
    assets_dir = Path(__file__).parent
    icons_dir = assets_dir / 'icons'
    
    # Create icons directory if it doesn't exist
    icons_dir.mkdir(exist_ok=True)
    
    # Convert icon SVG to various PNG sizes
    icon_svg = assets_dir / 'PLACEHOLDER_ICON.svg'
    splash_svg = assets_dir / 'PLACEHOLDER_SPLASH.svg'
    
    if not icon_svg.exists():
        print(f"Error: {icon_svg} not found!")
        return 1
    
    if not splash_svg.exists():
        print(f"Error: {splash_svg} not found!")
        return 1
    
    # Generate icon.png (1024x1024)
    convert_svg_to_png(icon_svg, icons_dir / 'icon.png', 1024, 1024)
    
    # Generate adaptive-icon.png (1024x1024)
    convert_svg_to_png(icon_svg, icons_dir / 'adaptive-icon.png', 1024, 1024)
    
    # Generate favicon.png (48x48)
    convert_svg_to_png(icon_svg, icons_dir / 'favicon.png', 48, 48)
    
    # Generate splash.png (1284x2778)
    convert_svg_to_png(splash_svg, assets_dir / 'splash.png', 1284, 2778)
    
    print("\n✅ All assets converted successfully!")
    print("\nGenerated files:")
    print("  - assets/icons/icon.png (1024x1024)")
    print("  - assets/icons/adaptive-icon.png (1024x1024)")
    print("  - assets/icons/favicon.png (48x48)")
    print("  - assets/splash.png (1284x2778)")
    
    return 0

if __name__ == '__main__':
    exit(main())
