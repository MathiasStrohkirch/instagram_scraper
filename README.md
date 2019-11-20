# Instagram Scraper

## To run

Have a csv file in the following format

| <>         | <>       | <>      |
|------------|----------|---------|
| <index_0>  | <file_0> | <url_0> |
| <index_1>  | <file_1> | <url_1> |
| ...        | ...      | ...     |

The script will save the profile image of the user as `<index>_<file>_profile` and all post images as `<index>_<file>_1`, `<index>_<file>_2`,`<index>_<file>_3`, ...

This script will ignore any posts not found and videos (but will still download the profile images and any post images of posts with videos)

**Requirements**

- git
- node.js

**In the terminal (after installing git and node.js):**

Clone repository:
`git clone https://github.com/MathiasStrohkirch/instagram_scraper`

Change directory to repository:
`cd instagram_scraper`

Install dependencies:
`npm install`

Run script:
`node scraper.js <path_to_csv_file>`

- Example command to run script:
`node scraper.js data.csv`
