import type { Access, CollectionConfig, FieldHook } from 'payload'

const isCreator: Access = function ({ req: { user } }) {
  if (!user) return false
  return { creator: { equals: user.id } }
}

const setCreatorOnCreate: FieldHook = function ({ req, operation, value }) {
  if (operation === 'create') {
    return req.user?.id
  }
  return value
}

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'assignee', 'dueDate', 'status', 'priority'],
  },
  access: {
    create: function ({ req: { user } }) {
      return Boolean(user)
    },
    read: function ({ req: { user } }) {
      return Boolean(user)
    },
    update: isCreator,
    delete: isCreator,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'dueDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'assignee',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'creator',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: function ({ user }) {
        return user?.id
      },
      admin: {
        readOnly: true,
      },
      access: {
        // Immutable once set - only the create hook below may populate it
        update: function () {
          return false
        },
      },
      hooks: {
        beforeChange: [setCreatorOnCreate],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'todo',
      options: [
        { label: 'To Do', value: 'todo' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Done', value: 'done' },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    {
      name: 'comments',
      type: 'join',
      collection: 'comments',
      on: 'task',
      admin: {
        defaultColumns: ['author', 'body', 'createdAt'],
      },
    },
  ],
  timestamps: true,
}
