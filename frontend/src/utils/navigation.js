export const mobileNav = [
  { to: '/', label: 'Home', icon: '⌂', exact: true },
  { to: '/generator', label: 'Create', icon: '✦', requiresEdit: true },
  { to: '/queue', label: 'Queue', icon: '▤' },
  { to: '/comments', label: 'Replies', icon: '◉' }
];

export function moreNavSections({ canEdit, isAdmin }) {
  const sections = [
    {
      title: 'More',
      items: [
        ...(canEdit
          ? [
              { to: '/menu-lab', label: 'Menu Lab', icon: '◈' },
              { to: '/weekly-planner', label: 'Planner', icon: '▦' }
            ]
          : []),
        { to: '/analytics', label: 'Analytics', icon: '◎' },
        { to: '/social-setup', label: 'Social Setup', icon: '⚙' }
      ]
    }
  ];

  if (isAdmin) {
    sections.push({
      title: 'Admin',
      items: [{ to: '/users', label: 'Team', icon: '◇' }],
      adminOnly: true
    });
  }

  return sections;
}
