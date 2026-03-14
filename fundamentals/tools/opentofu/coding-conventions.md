---
description: >-
  A set of rules, techniques, and best practices for creating a cleaner, more
  readable, and more efficient code base with minimal errors. It helps future
  authors, as well as code reviewers, align.
---

# Coding Conventions

<figure><img src="../../../.gitbook/assets/opentofu.png" alt="" width="170"><figcaption></figcaption></figure>

## Style Conventions

> The OpenTofu parser allows flexibility in laying out the elements in your configuration files. Still, the OpenTofu language also has some idiomatic style conventions, which we recommend users always follow for consistency between files and modules written by different teams.

{% hint style="info" %}
You can enforce these conventions automatically by running `tofu fmt`
{% endhint %}

* Understand the official OpenTofu [configuration syntax](https://opentofu.org/docs/language/syntax/configuration).
* Align with the official OpenTofu[ style conventions](https://opentofu.org/docs/language/syntax/style).

### Blocks

A block is a container for other content.

#### Block types should be in the following order and grouped with like types.

* [Providers](https://opentofu.org/docs/language/providers/): OpenTofu relies on "providers" plugins to interact with cloud providers, SaaS providers, and other APIs.
* [Data Sources](https://opentofu.org/docs/language/data-sources/): _Data sources_ allow OpenTofu to use the information defined outside of OpenTofu, defined by another separate OpenTofu configuration, or modified by functions.
* [Modules](https://opentofu.org/docs/language/modules/): _Modules_ are containers for multiple resources that are used together. A module consists of a collection of `.tofu` files in a directory.
* [Resources](https://opentofu.org/docs/language/resources/): _Resources_ are the most crucial element in the OpenTofu language. Each resource block describes one or more infrastructure objects, such as virtual networks, compute instances, or higher-level components, such as DNS records.

### Variables

[Variables](https://opentofu.org/docs/language/values/variables/) in OpenTofu define reusable and configurable values to parameterize your configuration.

#### Variables should be in alphabetical order. Keeping OpenTofu variables in alphabetical order has a few practical benefits:

* **More straightforward Navigation**: Finding variables becomes much faster, especially in large files, as they are easier to locate when sorted alphabetically.
* **Improved Readability**: A consistent structure enhances readability for others working on the same code, making it easier to understand and maintain.
* **Reduced Errors**: With variables organized, it's easier to spot duplicates or missing variables, minimizing potential errors.
* **Version Control**: Alphabetical order reduces the likelihood of large, confusing diffs in version control systems, as only new variables appear where they belong.
* **Consistency Across Teams**: It establishes a predictable format, improving team collaboration.

#### Avoid redundant variable names within the module's context when writing child modules. Avoiding redundant variable names in child modules offers several benefits:

* **Clarity**: Eliminates unnecessary repetition, making the code easier to understand.
* **Maintainability**: Reducing redundancy helps simplify future updates and modifications. Changing a variable name once is more manageable than updating multiple instances of a repetitive name.
* **Modularity**: Promotes better modular design, as variables are defined clearly within the context of the module, preventing confusion when modules are reused in different environments.
* **Consistency**: Encourages clean, consistent naming conventions across modules, improving readability and making it easier for others to work with the code.

#### When consuming child modules in root modules, prefix variable names with the module name. Prefixing variable names with the module name in root modules when consuming child modules offers several benefits:

* **Clarity and Traceability**: It clarifies where each variable comes from, mainly when multiple modules are used.
* **Avoiding Conflicts**: Prevents naming conflicts between variables from different modules, reducing the risk of overwriting or misusing values.
* **Consistency in Large Projects**: When dealing with large infrastructure projects, prefixed variable names help maintain a clean, organized structure, making it easier for teams to collaborate and manage the code.
* **Simplifies Debugging**: Prefixing helps pinpoint the source of issues faster, as it’s easier to identify which module a variable belongs to when troubleshooting.
* **Improved Readability**: In root modules, prefixed variables provide context at a glance, making the code more understandable for others working on the project.
