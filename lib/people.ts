// User/Person type for assignees
export type Person = {
  email: string
  name: string
}

// Helper functions to work with user data
export function getPersonByEmail(email: string, people: Person[]): Person | undefined {
  return people.find((p) => p.email === email)
}

export function getPeopleByEmails(emails: string[], people: Person[]): Person[] {
  return people.filter((p) => emails.includes(p.email))
}


