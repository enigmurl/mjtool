A react/typescript/electron desktop application created for viewing and downloading submissions to the Cupertino High School APCS website (https://apcs.tinocs.com).

This repository is not actively maintained, and only shows the commits that I (Manu) made myself. For an updated version, please visit the repo owned by Mr. McLeod and Mr. Ferrante (you may need to contact them to obtain access).

# Landing
The landing page allows you to set up the general configuration, as well as serve as the entry point to any of the quick filters (the three columns on the right). 
[Landing](github/landing.png)

# Plain
Plain view shows submissions by their date submitted, reversed. It's useful for seeing recent submissions of everyone, or of a particular student.
[Plain](github/plain.png)

# Ordered
Ordered view is nice for grouping submissions by class period and the assignment it was meant for. An image has not been provided as it would likely violate the students' privacy. 

# Initial Configuration
The following steps pertain to the general config, available on the left hand of the screen.
- Fill in the API fields with appropriate values. For the url, ensure that there is no trailing "/" 
- Select an export folder
- Select a teacher, and then periods you want to view. You can select multiple

# Per Lab Configuration
Simply use one of the three designated viewing templates to query submissions. 
- Assignment specific is the most common, which previews submissions for a single assignment, and adds a due date field for marking submissions as late
    - Use quick copy to copy spreadsheet data without having to visually load everything. It may still take a few seconds.
- Recent submissions is useful for looking at resubmits and related items.
- Student view allows you to see the most recent submissions for a given student (identified by their FUHSD ID)
- You can also play around with the filters at the top of the main page for more complex queries!
- **Important:** Download latest only downloads the latest version of any user (i.e. if a user submits two versions of an assignment that matches the specified filter, only version 2 will be downloaded). This helps prevents extraneous files from showing up.

# Potential Improvements 
- Make the app a full on grading tool, where the grading can be done on the app itself (and then the scores are available on the website). Jiaming and I ruled against this on the principle that it would be a significant amount of work (likely meaning I wouldn’t be able to finish before college, which is my soft deadline). Moreover, Google Sheets has the functionality of instant updates. While we have some solutions (i.e. claiming submissions in a locking mechanism), they’re all generally inferior.
- Include direct auto grader support. This is possible, but a bit tricky. It would likely involve having to call a Java subprocess. For now, we ruled that just having autograders in IntelliJ or Eclipse should be efficient enough
- Pagination (essentially all possible metadata results are loaded at once, rather than being lazy loaded). Probably shouldn’t matter too much in this particular case, since the user likely looks at every single metadata instance anyways.

# Potential Bugs
- Error handling in some situations can be confusing. However, once initial configuration is done properly, this should not be a real problem.
