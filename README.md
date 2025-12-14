# Your Product Name
Purrgrammers

## Table of Contents

- [Your Product Name](#your-product-name)
  - [Table of Contents](#table-of-contents)
- [Save Point](#save-point)
  - [Purrgrammers](#purrgrammers)
    - [Mission Statement](#mission-statement)
    - [Features](#features)
    - [Technical Implementation](#technical-implementation)
    - [Target Audience](#target-audience)
  - [Frontend Implementation](#frontend-implementation)
  - [Wireframes](#wireframes)
  - [User Flow](#user-flow)
  - [Logo](#logo)
  - [Fonts and Colours](#fonts-and-colours)
  - [Additional Notes](#additional-notes)


# Save Point

## Purrgrammers

### Mission Statement

*(gaming company) is currently using physical Post-it notes to assess multiple factors that occur during programming sprints. The team is expanding and is looking for a more effective way to manage this, which includes reporting on several defined areas. Save Point is a collaborative retrospective board app that enables teams at (gaming company) to assess, discuss, and measure what is going well, what needs improvement, and any actions that need to be taken during game production sprints. Retrospective boards provide a visual space for team members to express any concerns or wins they may have had. Allows for discussion and refinement of key issues or ideas, and returns measurable metrics for management to monitor team cohesion, satisfaction, and participation. Save Point will feature several key components, including the ability to post anonymously, vote on board posts, and download various data and reports.*

### Features

*Tell me the features your website will and will not have. Give detailed explanations; this is where you define the scope of your project.*

**All Features:**

| User Type | Access Role Type | Assignment |
|-----------|------------------|------------|
| Superuser/Admin | All access | - Can log in<br>- Can log out<br>- Create and manage other users<br>- Export data and reports<br>- Can see cards<br>- Can see and edit their details via the profile page<br>- access to full reporting features |
| Manager | Team Leader | - Can log in<br>- Can log out<br>- Can invite team members<br>- can create teams<br>- can remove team members<br>- post and edit own cards<br>- Can see and edit their details via their profile page<br>- can post a card anonymously<br>- access to relevant reports |
| Team member | | Can log in<br>Can log out<br>Can invite team members<br>Can invite other team members |

**Board Feature Access:**

| Feature | Access | Notes/Conditions |
|---------|--------|------------------|
| Retro Board | Can be created by any user | |
| Card | Can be created by any user in the team session | Limit text length |
| Post | Any logged in and invited user can post card to board | |
| View | Any invited team member and superuser can view cards | |
| Edit | Session can be edited by session creator<br>Any card can be edited by card creator | Edit button<br>User ID (or would this only come up for reporting)<br>User name displayed unless opt in chosen for anonymous |
| Opt in for anonymous | | |
| Timer | Timer to be started by session creator | timer/clock count down |
| Voting option | All users in session | Yes, no, neutral (emojis) |
| Export | Admin only | CSV?? |
| Columns | Session creator | Going well, drop, improve (positve language) |
| Actions | | |

**Collections Feature Access:**

| Feature | Access | Notes/Conditiions |
|---------|--------|-------------------|
| Assign Teams to Collection? | | Based on the Team members? |
| Assign Notes within the Session to the team collection | | Based on keywords? |
| Export Post by collection | Admin | |

**Pages/Endpoint Functionality:**

| Endpoint | Functionality | Comments |
|----------|---------------|----------|
| Create Session | Any user<br>Can edit session<br>Can edit own card | Multiple sessions can be created by different teams |
| Post card | Any user | |
| Session board | Allow more than one card to be posted | Users can post multiple cards |
| Admin page | All admin functions<br>can create additional admins | Requires auth |

**Must Haves:**

| Feature | Access | Comments |
|---------|--------|----------|
| Superuser/Admin | All access | - Can log in<br>- Can log out<br>- Create and manage other users |
| Custom User | Create profile<br>Login<br>Log out | |
| Retro Board | Can be created by a custom user | |
| Columns | | Start/Stop/Continue/Action |
| Cards | Anonymous ability | |

**Wishlist:**

Avatar (Emma has done the backend, frontend we use a site called dicebear - initial logo)
Flexible, Lightweight and easy to use (mvp)
Report on engagement vs attendance/categories for reporting
Engagement Numbers
*Timer
Cards customisable throughout process
2 minute video on how to use for employee training
Feedback button to company (us) for issues
Reminder of last retro
Organisation - ability to add other companies/businesses
Voting comments*

### Technical Implementation

*What languages and frameworks will you be using? What kind of database will you be using? How will you deploy the website?*

**Languages & Frameworks:**

**Back-end:** 
Django
DRF

**Front-end:** 
Javascript
React, 
HTML
CSS

**Database:** sqlite

**Deployment:** 
Heroku
Netlify 
Git Hub

### Target Audience

*App is for (gaming company) to reflect on short sprints in game production. Teams will consist of up to eight people, consisting of coders/project managers/team leaders.*

## Frontend Implementation

## Wireframes

[Wireframes image placeholder]

## User Flow

[User flow diagram placeholder]

## Logo

[Logo image placeholder]

## Fonts and Colours

*List the fonts and colours for your website.*

**Colours:**
- #8246AF - Purple
- #F9A426 - Orange
- #000000 - Black
- #FFFFFF - White

**Fonts:**

**Stack Sans Notch**
Save Point is a retrospective app that allows teams to review and discuss team production and cohesion issues

**Momo Trust Display**
Save Point is a retrospective app that allows teams to review and discuss team production and cohesion issues


---

## Additional Notes

**Inspiration/Competitors:**
- https://echometerapp.com/en/
- https://miro.com/
- https://www.atlassian.com/software/jira
- https://easyretro.io/

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributors

- Emma Spear
- Krista Soosaar
- Tammy Healy
- Juliane Gutierrez
- Jinfeng Shan
