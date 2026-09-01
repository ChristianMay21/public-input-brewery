import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'manager'],
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'manager',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'directReports',
      type: 'join',
      collection: 'users',
      on: 'manager',
      admin: {
        defaultColumns: ['name', 'email'],
      },
    },
  ],
}
