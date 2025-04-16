# danceright!

a dance courses and classes booking website that allows users to explore, book, and manage both full courses and ad-hoc classes. the site supports local login/registration as well as external authentication (via github) and provides a dashboard for organiser users to manage courses, classes, and users.

---

## features

- **user authentication**
    - local authentication: login and registration with email and password
    - external authentication: github login integration
    - session management (auto-login and logout)

- **booking system**
    - course booking: users can book full courses with selected dates
    - class booking: users can book individual classes by selecting a timeslot
    - duplicate booking prevention: checks to ensure the same booking is not added twice
    - session control for registered versus unregistered users

- **management dashboard**
    - organiser dashboard for managing courses, classes, and users
    - user profile and booking management
    - pages for editing, adding, and deleting courses, classes, and user accounts

- **public-facing pages and pagination**
    - responsive pages for the home page, courses, and classes
    - pagination implemented on courses and classes listings

- **api endpoints and views**
    - endpoints returning json for courses, classes, and users
    - html views rendered via a layout engine, integrating flash messages

---

## how to run
**Clone the repository**
   ```bash
   git clone https://github.com/russsseeelll/WebDevCoursework2.git
   cd WebDevCoursework2
```

**Install dependencies**

make sure you have node.js installed 
```bash
npm install
```

**configure environment variables**

create a .env file in the project root with the following variables:

```bash
GITHUB_CLIENT_ID=

GITHUB_CLIENT_SECRET=

GITHUB_CALLBACK_URL=

DEMO_MODE= (true or false)
```

adjust variables as needed.

**Start the server**
```bash
npm start
```

the site will be available at http://localhost:3000.

**run tests**
```bash
npm test
```

**additional notes**

    The site uses express.js as the web framework and passport.js for authentication

    The project structure is organized with separate folders for controllers, routes, and models

    View templates use a layout rendering engine to simplify page structure

    The booking logic ensures that duplicate bookings are merged and session data is maintained correctly

Enjoy exploring danceright!