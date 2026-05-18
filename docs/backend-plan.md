# Duo Backend Plan

## Goal

Duo needs to become a real shared app for two connected people.

Right now the app works locally in the browser. The next major step is making cards, partner connection, and history exist online so both people can see the same responsibility state.

The backend should stay simple and support Duo’s core idea:

- signals, not messages
- no chat
- no comments
- one connected partner
- responsibility state over conversation
- calm notifications
- history as closure, not monitoring

---

## Main Things the Backend Must Store

### 1. Users

A user is one person using Duo.

The app needs to know who is logged in.

Example:

```text
User
- id
- email
- createdAt