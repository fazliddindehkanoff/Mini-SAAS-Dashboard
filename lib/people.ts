// Dummy people data - in real app this would come from API
export type Person = {
  email: string
  name: string
}

export const people: Person[] = [
  { email: "john.doe@example.com", name: "John Doe" },
  { email: "jane.smith@example.com", name: "Jane Smith" },
  { email: "bob.johnson@example.com", name: "Bob Johnson" },
  { email: "alice.williams@example.com", name: "Alice Williams" },
  { email: "charlie.brown@example.com", name: "Charlie Brown" },
  { email: "diana.prince@example.com", name: "Diana Prince" },
  { email: "frank.miller@example.com", name: "Frank Miller" },
  { email: "grace.lee@example.com", name: "Grace Lee" },
]

export function getPersonByEmail(email: string): Person | undefined {
  return people.find((p) => p.email === email)
}

export function getPeopleByEmails(emails: string[]): Person[] {
  return people.filter((p) => emails.includes(p.email))
}

