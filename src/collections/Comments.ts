import type { Access, CollectionConfig, FieldHook } from 'payload'

const isAuthor: Access = function ({ req: { user } }) {
  if (!user) return false
  return { author: { equals: user.id } }
}

const setAuthorOnCreate: FieldHook = function ({ req, operation, value }) {
  if (operation === 'create') {
    return req.user?.id
  }
  return value
}

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'body',
    defaultColumns: ['task', 'author', 'body', 'createdAt'],
  },
  access: {
    create: function ({ req: { user } }) {
      return Boolean(user)
    },
    read: function ({ req: { user } }) {
      return Boolean(user)
    },
    update: isAuthor,
    delete: isAuthor,
  },
  fields: [
    {
      name: 'task',
      type: 'relationship',
      relationTo: 'tasks',
      required: true,
    },
    {
      name: 'author',
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
        beforeChange: [setAuthorOnCreate],
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
  ],
  timestamps: true,
}
