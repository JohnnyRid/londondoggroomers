      // Generate breadcrumb JSON-LD
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://london-dog-groomers.vercel.app';
      const breadcrumbList = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': `${siteUrl}`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Dog Groomers',
            'item': `${siteUrl}/groomers`
          },
          ...(locationName ? [{
            '@type': 'ListItem',
            'position': 3,
            'name': `${locationName} Dog Groomers`,
            'item': `${siteUrl}${generateLocationUrl(locationName)}`
          }] : []),
          {
            '@type': 'ListItem',
            'position': locationName ? 4 : 3,
            'name': groomer.name,
            'item': `${siteUrl}${currentPath}`
          }
        ]
      };