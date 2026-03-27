# Mintlify Documentation

This repository uses [Mintlify](https://mintlify.com/) for its documentation portal, providing a modern, searchable, and interactive documentation experience.

## 📖 Documentation Portal

View the live documentation at: [Your Mintlify Docs URL]

## 🚀 Quick Start

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn

### Installation

```bash
npm install
```

This will install Mintlify along with all other dependencies.

### Development

Run the documentation locally:

```bash
npm run docs:dev
```

This will start a local development server, typically at `http://localhost:3000`.

### Building

Build the documentation for production:

```bash
npm run docs:build
```

## 📁 Documentation Structure

```
.
├── mint.json                    # Mintlify configuration
├── introduction.mdx             # Introduction page
├── quickstart.mdx               # Quick start guide
├── installation.mdx             # Installation guide
├── api-reference/               # API documentation
│   ├── erc721.mdx
│   ├── erc20.mdx
│   ├── bitcoin-mining.mdx
│   ├── feature-flags.mdx
│   └── ...
└── guides/                      # User guides
    ├── chatops.mdx
    ├── publishing.mdx
    ├── deployment.mdx
    └── security.mdx
```

## 🎨 Customization

### Branding

The documentation uses the BeyondGlobal logo and brand colors defined in `mint.json`:

```json
{
  "logo": {
    "light": "/BeyondGlobal.svg",
    "dark": "/BeyondGlobal.svg"
  },
  "colors": {
    "primary": "#0D9373",
    "light": "#07C983",
    "dark": "#0D9373"
  }
}
```

### Navigation

The navigation structure is defined in `mint.json` under the `navigation` key. To add new pages:

1. Create a new `.mdx` file in the appropriate directory
2. Add the path to `mint.json` navigation
3. Test locally with `npm run docs:dev`

### Adding New Pages

1. Create an MDX file:

```mdx
---
title: 'Your Page Title'
description: 'Your page description'
---

## Content

Your content here...
```

2. Add to `mint.json`:

```json
{
  "navigation": [
    {
      "group": "Your Group",
      "pages": [
        "path/to/your-page"
      ]
    }
  ]
}
```

## 📝 Writing Documentation

### MDX Format

Documentation pages use MDX (Markdown + JSX), allowing you to:

- Use standard Markdown syntax
- Embed React components
- Use Mintlify's built-in components

### Available Components

#### Card Groups

```mdx
<CardGroup cols={2}>
  <Card title="Card 1" icon="icon-name" href="/link">
    Description
  </Card>
  <Card title="Card 2" icon="icon-name" href="/link">
    Description
  </Card>
</CardGroup>
```

#### Code Groups

```mdx
<CodeGroup>

\`\`\`bash npm
npm install package
\`\`\`

\`\`\`bash yarn
yarn add package
\`\`\`

</CodeGroup>
```

#### Accordions

```mdx
<AccordionGroup>
  <Accordion title="Question 1">
    Answer 1
  </Accordion>
  <Accordion title="Question 2">
    Answer 2
  </Accordion>
</AccordionGroup>
```

#### Parameter Fields

```mdx
<ParamField path="paramName" type="string" required>
  Parameter description
</ParamField>
```

#### Callouts

```mdx
<Note>
  This is a note
</Note>

<Warning>
  This is a warning
</Warning>

<Info>
  This is info
</Info>
```

## 🔧 Configuration

### mint.json

The main configuration file for Mintlify. Key sections:

- **name**: Documentation site name
- **logo**: Logo configuration
- **colors**: Brand colors
- **navigation**: Page structure
- **topbarLinks**: Links in the top bar
- **footerSocials**: Social media links
- **tabs**: Additional navigation tabs

### Example Configuration

```json
{
  "$schema": "https://mintlify.com/schema.json",
  "name": "Big World Bigger Ideas",
  "logo": {
    "light": "/BeyondGlobal.svg",
    "dark": "/BeyondGlobal.svg"
  },
  "colors": {
    "primary": "#0D9373",
    "light": "#07C983",
    "dark": "#0D9373"
  },
  "navigation": [
    {
      "group": "Getting Started",
      "pages": ["introduction", "quickstart", "installation"]
    }
  ]
}
```

## 🚀 Deployment

### Mintlify Cloud

The recommended way to deploy is using Mintlify's hosting:

1. Connect your GitHub repository to Mintlify
2. Mintlify will automatically build and deploy on every push
3. Get a custom subdomain or use your own domain

### Self-Hosting

You can also build and host the documentation yourself:

```bash
npm run docs:build
```

The build output will be in `.mintlify/` directory.

## 🔍 Search

Mintlify provides built-in search functionality across all documentation pages. The search index is automatically generated from your content.

## 📊 Analytics

To enable analytics, add your tracking IDs to `mint.json`:

```json
{
  "analytics": {
    "ga4": {
      "measurementId": "G-XXXXXXXXXX"
    }
  }
}
```

## 🤝 Contributing

When contributing documentation:

1. Follow the existing structure and style
2. Test locally with `npm run docs:dev`
3. Ensure all links work correctly
4. Check that code examples are accurate
5. Preview changes before submitting

## 📚 Resources

- [Mintlify Documentation](https://mintlify.com/docs)
- [MDX Documentation](https://mdxjs.com/)
- [Repository README](./README.md)
- [ChatOps Guide](./CHATOPS.md)

## 🐛 Troubleshooting

### Documentation not loading locally

**Problem**: `npm run docs:dev` fails or doesn't show content

**Solutions**:
- Ensure all dependencies are installed: `npm install`
- Check `mint.json` for syntax errors
- Verify all referenced files exist
- Check console for error messages

### Build failures

**Problem**: `npm run docs:build` fails

**Solutions**:
- Validate `mint.json` syntax
- Check all MDX files for errors
- Ensure all images and assets exist
- Review build logs for specific errors

### Broken links

**Problem**: Links in documentation don't work

**Solutions**:
- Use relative paths for internal links
- Don't include `.mdx` extension in links
- Check file paths in `mint.json` navigation
- Test all links locally before deploying

## 📄 License

The documentation follows the same ISC license as the main project.

---

**Created by**: [Matthew Brace (kushmanmb)](https://github.com/kushmanmb)  
**Repository**: [Big-world-Bigger-ideas](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-)
