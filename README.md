# Instagram Scraper

## To run

Have a csv file in the following format

| <>  | <>       | <>      |
|-----|----------|---------|
| <>  | <file_0> | <url_0> |
| <>  | <file_1> | <url_1> |
| ... | ...      | ...     |

The script will save the profile image of the user as `<file_0>_profile` and all post images as `<file_0>_0`, `<file_0>_1`,`<file_0>_2`, ...

In the terminal:

`node scraper.js <path_to_csv_file>`
