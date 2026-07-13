const { gql } = require('apollo-server-express');

module.exports = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    department: String
    position: String
    createdAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Attendance {
    id: ID!
    user: User!
    date: String!
    checkIn: String
    checkOut: String
    hoursWorked: Float
    status: String
  }

  type Leave {
    id: ID!
    user: User!
    type: String!
    startDate: String!
    endDate: String!
    reason: String!
    status: String!
    reviewedBy: User
    reviewNote: String
    createdAt: String
  }

  type Stats {
    totalEmployees: Int!
    presentToday: Int!
    pendingLeaves: Int!
    approvedLeaves: Int!
  }

  type Query {
    me: User
    myAttendance: [Attendance!]!
    todayAttendance: Attendance
    myLeaves: [Leave!]!
    allLeaves: [Leave!]!
    allAttendance: [Attendance!]!
    allEmployees: [User!]!
    stats: Stats!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, department: String, position: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    checkIn: Attendance!
    checkOut: Attendance!

    requestLeave(type: String!, startDate: String!, endDate: String!, reason: String!): Leave!
    reviewLeave(id: ID!, status: String!, reviewNote: String): Leave!
  }
`;
