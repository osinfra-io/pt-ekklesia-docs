# Testing

OpenTofu modules on this platform are tested using [OpenTofu's built-in test framework](https://opentofu.org/docs/language/tests/) with mock providers — no real infrastructure or credentials are required to run tests.

## tofu test

Test files use the `.tftest.hcl` extension and live in a `tests/` directory at the module root. Each test file declares `mock_provider` blocks and one or more `run` blocks:

```hcl
mock_provider "google" {}
mock_provider "google-beta" {}

run "defaults" {
  command = apply

  variables {
    project = "my-project"
  }

  assert {
    condition     = google_project.this.name == "my-project"
    error_message = "unexpected project name"
  }
}
```

All `pt-arche-*` modules include tests. The `test.yml` workflow in each module repo runs `tofu test` automatically on every pull request via [pt-techne-opentofu-workflows](https://github.com/osinfra-io/pt-techne-opentofu-workflows).

## Pre-Commit Hooks

The [pt-techne-pre-commit-hooks](https://github.com/osinfra-io/pt-techne-pre-commit-hooks) repository provides three hooks that run automatically before every commit:

| Hook | What it does |
|---|---|
| `tofu-fmt` | Rewrites `.tofu`, `.tf`, and `.tfvars` files to canonical format |
| `tofu-validate` | Validates syntax and internal consistency (no remote API calls) |
| `tofu-test` | Runs `.tftest.hcl` tests from the module root |

Run all hooks across every file at any time:

```bash
pre-commit run -a
```

{% hint style="info" %}
Run `pre-commit autoupdate --freeze` at the start of each session to update hook SHAs before running `pre-commit run -a`.
{% endhint %}

See [Techne](../../../product-guides/techne/README.md) for more details on the pre-commit hooks and OpenTofu workflows.

