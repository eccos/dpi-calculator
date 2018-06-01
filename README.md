# dpi-calculator
Fork of Sven Neuhaus' \<sven@sven.de\> [DPI Calculator](https://www.sven.de/dpi/)

+ Removed the table tags from the monitor data form and replaced it with divs
+ Added "change" event to input fields, so the result would update when data is changed using increment buttons
+ Changed result data
  + Now displayed in a 2 column list
  + For the following monitor data "1920x1080 24in", the result displays as...
    + (Before) Display size: 20.92" × 11.77" = 246.12in² (53.13cm × 29.89cm = 1587.9cm²) at 91.79 PPI, 0.2767mm dot pitch, 8425 PPI²
    + (After) 1920x1080 24in at 91.79 PPI
+ Removed "Noteworthy and common display sizes of monitors..." because I found no value in them.
+ Updated "Resolutions". Ordered by aspect ratio. Including only common ratios (16:9, 16:10, and ultrawide)
