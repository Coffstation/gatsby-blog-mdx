const path = require("path")
const { createFilePath } = require("gatsby-source-filesystem")

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    // Create slug
    const slug = createFilePath({ node, getNode, basePath: `` })
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  const postTemplate = path.resolve(
    "src/components/posts/post-template/index.jsx"
  )

  return graphql(`
    {
      allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              tags
              date
              excerpt
              draft
            }
          }
        }
      }
    }
  `).then(res => {
    if (res.errors) {
      return Promise.reject(res.errors)
    }
    // console.log(JSON.stringify(res, null, 4)) ///

    // Create pages & register paths
    const edges = res.data.allMarkdownRemark.edges
    edges.forEach((edge, i) => {
      const node = edge.node

      let prevNode = i !== edges.length - 1 ? edges[i + 1].node : null
      let nextNode = i !== 0 ? edges[i - 1].node : null

      const prev =
        i === edges.length - 1 ||
        isAboutPage(prevNode) ||
        isDraft(prevNode) ||
        isDummy(prevNode)
          ? null
          : prevNode
      const next =
        i === 0 ||
        isAboutPage(nextNode) ||
        isDraft(nextNode) ||
        isDummy(nextNode)
          ? null
          : nextNode

      if (node.fields.slug !== "/__do-not-remove/") {
        createPage({
          path: node.fields.slug,
          component: postTemplate,
          context: {
            slug: node.fields.slug,
            next,
            prev,
          },
        })
      }
    })
  })
}

const isAboutPage = node => {
  return node.fields.slug === "/about/"
}

const isDraft = node => {
  return node.frontmatter.draft === true
}

const isDummy = node => {
  return node.frontmatter.tags.includes("___dummy*")
}
