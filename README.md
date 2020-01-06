# hour-entry
A tool for hour tracking.  <https://hour-entry.henderea.com>

## Using the Tool
The tool uses the format `label: 1h`.  You can have multiple labels on the same line, but only 1 time value is allowed per line.  Valid formats are `1h`, `0.5h`, `.5h`, `30m`, `1h 30m`, `1h 30` (assumes minutes for the second number) and `1` (assumes hours when no unit provided).

If you place a label without any value on a line, it will show the total of the lines in the same group, going until it encounters a blank line or the end of the document.  You can also use a date range in the format `MM/DD/YYYY - MM/DD/YYYY:` on its own line to show the total for all lines and groups with dates (formatted as `MM/DD/YYYY`) in that range.

The tool will highlight the syntax as you type, and the data you enter is stored in the browser's `localStorage`, automatically loaded each time you open the page in the same browser/profile.

## To Set Up

```shell
$ yarn
```

## To Test

```shell
$ yarn start
```

## To Build for Production

```shell
$ yarn build
```

## To Deploy to now.sh

```shell
$ yarn deploy
```
