# google-apps-scripts

Miscellaneous collection of Google Apps Scripts.

To add a script to an existing document, go to `Tools > Script editor...` and
paste the relevant Javascript into the new window that appears. Then reload your
document.

## google-docs-word-count

Ignores table of contents when calculating word count. Optionally lets you
manually adjust the word count, or have a custom "ignore everything after this
point" marker.

You can also directly update a spreadsheet with your word count — useful for
writing challenges like NaNoWriMo. (It does assume that your spreadsheet is laid
out the same way as mine is, however; I'll make it more generic if folks ask for
it.)

Combine all the Javascript files into one big one for ease of pasting into the
Google Apps Script editor:

`rm WordCount.gs ; cat *.gs > WordCount.gs`
