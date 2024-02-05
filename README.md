<a name="readme-top"></a>

[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/emirtuncer/yanodam-api">
    <img src=".readmeFiles/logo512.png" alt="Logo" width="160" height="160">
  </a>

<font align="center" size="32">Yan Odam</font>

  <p align="center">
    Yan Odam REST API with NestJS
    <br />
    <a href="https://github.com/emirtuncer/yanodam-api">
    <br />
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <a href="#features">Features</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<div style="width:30%; margin: auto;">

![entity relationship model][erm-screenshot]
![e2e tests][tests-screenshot]

</div>

Yan Odam is a REST API project with NestJS. This is the first version of Yan Odam's backend, a simple project that has a few endpoints to manage users and their roles, demonstrating the capabilities of NestJS.

### Features

- [x] Authentication /w JWT
- [x] User Service
- [x] House Service
- [x] PostgreSQL Database
- [x] Prisma ORM
- [x] PactumJS for E2E Testing
- [x] Socket.io for Chat

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Nest][nest.js]][nest-url]
- [![Pactum][pactum]][pactum-url]
- [![PostgreSQL][postgresql]][postgresql-url]
- [![PrismaORM][prisma]][prisma-url]
- [![Socket.io][socket.io]][socket.io-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running, follow these simple steps.

### Prerequisites

- Docker

### Installation

1. Run Docker on your local machine. [https://www.docker.com/](https://www.docker.com/)
2. Clone the repo.
   ```sh
   git clone https://github.com/emirtuncer/yanodam-api
   ```
3. Install NPM packages.
   ```sh
   yarn
   ```
4. Start the development environment.
   ```sh
   yarn start:dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

Run e2e tests

```sh
yarn test:e2e
```

Prisma Studio on test environment

```sh
npx dotenv -e .env.test -- prisma studio
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] Chat with Socket.io

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[license-shield]: https://img.shields.io/github/license/emirtuncer/yanodam-api.svg?style=for-the-badge
[license-url]: https://github.com/emirtuncer/yanodam-api/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/emir-tuncer
[erm-screenshot]: .readmeFiles/ERM.png
[tests-screenshot]: .readmeFiles/testScreenshot.png
[nest.js]: https://img.shields.io/badge/nest.js-000000?style=for-the-badge&logo=nestjs&logoColor=crimson
[nest-url]: https://nestjs.com
[pactum]: https://img.shields.io/badge/pactumjs-000000?style=for-the-badge&logo=pactumjs&logoColor=white
[pactum-url]: https://pactumjs.github.io/
[postgresql]: https://img.shields.io/badge/postgresql-000000?style=for-the-badge&logo=postgresql&logoColor=blue
[postgresql-url]: https://www.postgresql.org/
[prisma]: https://img.shields.io/badge/prisma-000000?style=for-the-badge&logo=prisma&logoColor=green
[prisma-url]: https://www.prisma.io/
[socket.io]: https://img.shields.io/badge/socket.io-000000?style=for-the-badge&logo=socket.io&logoColor=cyan
[socket.io-url]: https://socket.io/
