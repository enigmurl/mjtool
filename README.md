*** THIS REPOSITORY IS AN ARCHIVE AND NOT ACTIVELY MAINTAINED VISIT https://github.com/tedMcleod/mjtool/ FOR THE CHS UPDATED REPOSITORY ALONG WITH PROPER RELEASES ***

# Manu - Jiaming Tool (MJ Tool)

A react/typescript/electron desktop application created for viewing and downloading submissions to the Cupertino High School APCS website (https://apcs.tinocs.com). See bottom for more technical details.

This repository is not actively maintained, and only shows the commits that I (Manu) made myself. For an updated version, please visit the repo owned by Mr. McLeod and Mr. Ferrante (you may need to contact them to obtain access).

## Landing
The landing page allows you to set up the general configuration, as well as serve as the entry point to any of the quick filters (the three columns on the right). (Note, this screenshot was taken before server profiles were added!)
![Landing](.github/landing.png)

## Plain
Plain view shows submissions by their date submitted, reversed. It's useful for seeing recent submissions of everyone, or of a particular student.
![Plain](.github/plain.png)

## Ordered
Ordered view is nice for grouping submissions by class period and the assignment it was meant for. An image has not been provided as it would likely violate the students' privacy. 

## Installation
- See bottom of page for building and running source code
- Latest releases also available on right hand side under "Releases column"

Download Links
- mac: https://github.com/enigmurl/mjtool/releases/download/1.0.0/mjtool.mac.zip
- windows: https://github.com/enigmurl/mjtool/releases/download/1.0.0/mjtool.windows.zip

For mac, unzip the download and simply open the "mjtool.app" file
For windows, unzip the download and navigate to the "mjtool.exe" file and run it. This is likely under the "mjtool-win32-x64" folder.

**You may be warned that the app is unrecognized, run it anyways**

# Initial Configuration
The following steps pertain to the general config, available on the left hand of the screen.
- Fill in the API fields with appropriate values. For the url, ensure that there is no trailing "/" 
- Select an export folder
- Select a teacher, and then periods you want to view. You can select multiple
- If you would like multiple server profiles to switch between APCS and Intro Java, just simply click "Add Server," and fill out details like before. All settings are saved and you can switch between the different profiles by using the dropdown. Theoretically, you can have multiple "server profiles" pointing to the same hostname, if you so desire.

# Per Lab Configuration
Simply use one of the three designated viewing templates to query submissions. 
- Assignment specific is the most common, which previews submissions for a single assignment, and adds a due date field for marking submissions as late
    - Use quick copy to copy spreadsheet data without having to visually load everything. It may still take a few seconds.
- Recent submissions is useful for looking at resubmits and related items.
- Student view allows you to see the most recent submissions for a given student (identified by their FUHSD ID)
- You can also play around with the filters at the top of the main page for more complex queries!
- **Important:** Download latest only downloads the latest version of any user (i.e. if a user submits two versions of an assignment that matches the specified filter, only version 2 will be downloaded). This helps prevents extraneous files from showing up. You are free to manually download version 1, of course.

# Potential Improvements 
- General search feature. The problem comes that a lot of the storage on the database is disconnected, the general search means filtering in a lot of different places in the app. From a technical standpoint, it involves a second round of filtering after the categorization step, which builds the state tree. the other filters, however, work before the categorization step, either on the database itself or on the client which filters assignments when there's more than 1. This is rather ugly, and ideally all of it would happen on the server to be perfectly honest.
- Make the app a full on grading tool, where the grading can be done on the app itself (and then the scores are available on the website). Jiaming and I ruled against this on the principle that it would be a significant amount of work (likely meaning I wouldn’t be able to finish before college, which is my soft deadline). Moreover, Google Sheets has the functionality of instant updates. While we have some solutions (i.e. claiming submissions in a locking mechanism), they’re all generally inferior.
- Include direct auto grader support. This is possible, but a bit tricky. It would likely involve having to call a Java subprocess. For now, we ruled that just having autograders in IntelliJ or Eclipse should be efficient enough
- Pagination (essentially all possible metadata results are loaded at once, rather than being lazy loaded). Probably shouldn’t matter too much in this particular case, since the user likely looks at every single metadata instance anyways.
- Another optimization is solving the problem of the client currently sending redundant API calls. Cacheing could be an easy fix, but is not a good solution. A lot of the redundancy comes from researching even on intermediate states (i.e. when you're typing a student id, and are only halfway there).

# Potential Bugs
- Error handling in some situations can be confusing. However, once initial configuration is done properly, this should not be a real problem.

# Source Running
- Download npm (https://nodejs.org/en/)
- clone this repository `git clone https://github.com/enigmurl/mjtool.git`
- using terminal, navigate to the root folder
- install yarn `npm install --global yarn`
- install mjtool dependencies `yarn upgrade`
- run mjtool `yarn start`
- Pull changes with `git pull && yarn upgrade`
- If a yarn start doesn't work after pulling, try deleting the .webpack directory

# Source Building
- Follow Source Running steps, and also run `yarn make`

# Technical Overview
The MJTool application uses electron, typescript, and react for development. The main application works by having a landing page where you can predefine “querying configurations” for a list of servers, as well as keep track of which server is active. The landing page allows you to travel to the main filtering page, where it propagates the API credentials and relevant filters based on the chosen selections. Here is a main summary of the landing page files:

 - landing/landing.css - Style sheet for landing page elements
 - landing/landing.tsx - UI entry point to landing page, puts all UI elements in a row. Also responsible for holding the landing_state
 - landing/state_provider.tsx - holds the ‘state’ of each server configuration, as well as which server is active. Responsible for syncing the entirety of the configuration with the file system.
 - landing/general_config.tsx - Holds the UI for selecting which server is active, as well as the configuration of that server
 - landing/assignment_specific.tsx - Holds the UI and application logic for opening the main portal with filters set to a single assignment. Most commonly used.
 - landing/recent_submissions.tsx - Holds the UI and application logic for opening the main portal with filters set to recent submissions (of everyone), or of a particular student

In the main page, filters can still be changed. The filters are kept as application state and a change in the filters causes a rerequest to the server for relevant submission metadata. From here, a first round of client side filtering is applied to only select certain assignments (as this is not always handled by the server). Then based on the grouping of ordered or plain, MJTool displays the relevant data slightly differently. In each case, however, “categorization” is always done first where a second round of client-side filtering is done to respect the search string. Other steps of categorization include grouping submissions into assignments/period/etc (essentially a tree). In the “ordered” view, “linting” is done where auto generated comments (not to be confused with user provided comments) are added. In the “plain” view, submissions are “flattened” based on submission time, creating one giant list. Note that at this stage, only the metadata of the submission (stuff like timestamp, user) has been retrieved, and the actual submissions are still only on the server. When a full download is requested, all submissions are downloaded from the server based on the filters, but generally only the latest submissions of each user will be visible since they will overwrite old submissions with the same name. When a quick copy is requested, the data is recategorized (but should still be the same stuff as on screen) and relinted, and then turned into a string that is put into the user’s pasteboard. Here is a summary of each file used in the main viewer:

 - main/main.css - Stylesheet for main viewing page elements
 - main/main.tsx - Does a few different things. For one, it takes in the application state sent over from the landing page (so all the filters and config) and copies it over. main.tsx is responsible for holding the main application state. Also, has all the UI related logic for the toolbar (aka where the filters are). Finally, controls the overall UI of, which is mainly just switching between the Ordered and Plain view whenever toggled.
 - main/ordered.tsx - Takes in the application state and provides the UI logic for showing the selected assignments in a categorized manner. It is technically responsible for doing the linting to preview the auto generated comments, as well as doing the categorization from the raw 
 - main/plain.tsx - Takes in the application state and provides UI logic for showing selected assignments in reverse chronological order. Again, still does categorization (to account for filters), but then flattens it afterwards. 
 - main/shared_ui.tsx - Shared UI elements applicable to both ordered and plain views
 - main/spreadsheet_manager.tsx - Handles linting (generation of late/missing/naming comments) as well as turning a single student into a string that can be copy pasted into a spreadsheet. Finally, it houses the spreadsheet header string as well. It does *not* handle turning the entire state into a full spreadsheet-compatible string (that’s done by tasks.tsx in copy).
 - main/tasks.tsx - Does basically everything else, which is admittedly probably the most messy, but hopefully the above paragraph helps make it a bit more clear. For one, this includes handling download commands and quick copy commands. Also, given the base filters, it asks the server for relevant submissions and applies the first round of filtering. Then, it also provides a categorization function, which also takes care of a second round of filtering. Its other major purpose is for flattening, which takes a hierarchy of assignments and returns a reverse chronological, flat ordering of them. Finally, it has a utility function for showing alerts (i.e. when downloading finishes/errors occurred) which should probably be somewhere else. In some sense, it’s kind of a proxy that sits on top of util/proxy.ts.
  
For completeness, a summary of other files:

 - index.ts - Sets up (mainly) boilerplate functions for interacting with the operating system, and receiving messages from the rendering process
 - renderer.tsx - Entry point into rendering process that sets up router for switching between landing and main page
 - index.html - Base HTML page that will eventually be populated by React, not super interesting
global.css - Style sheet that’s used throughout the application (stuff like text, buttons, etc)
 - util/async.css - Style sheet for loading icons
 - util/async.tsx - Provides some utility functions for handling async requests, and showing loading icons while a promise is resolving
 - util/date.ts - Provides utility functions for displaying and processing dates. 
 - util/proxy.ts - Sits as a proxy between MJTool and the server, and essentially maps a lot of the server’s API endpoints into more easily callable functions. Also provides type declarations for useful constructs (like student_meta, submission_meta, etc)

