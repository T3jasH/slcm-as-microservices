# Student LifeCycle Management Portal 

This is an attempt at building a college portal for students, using microservices.  

## This project uses

    - Object oriented programming
    - Layered Architecture: Code is split up into controllers - for handling http part of request response; services - where business logic exists; and repository - all database interactions happen here.
    - Dependency injection: Single instance of a class is created at runtime and shared throughout all components. DI makes unit testing easier.
    - Few unit and integration tests using jest.
    - Database per microservice pattern: Data belonging to a microservice is present in its own database. No other microservice can directly access this database.

## Architecture

    - User microservice contains all user level data and provides authentication. It acts as gateway as well
    - Course microservice contains data about each stream, course, department and class.
    - Exams microservice will contain internal and end sem marks, grades.
    - Similarly separate microservices for attendance, fee payment and tracking, notifications of all sorts.

## Tech stack

    - NodeJS
    - Typescript
    - MongoDB
    - Jest
    - Docker  