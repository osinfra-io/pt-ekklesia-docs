# Testing

OpenTofu modules on this platform are tested using [OpenTofu's built-in test framework](https://opentofu.org/docs/cli/commands/test) with mock providers — no real infrastructure or credentials are required to run tests.

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

All `pt-arche-*` modules include tests. The `test.yml` workflow in each module repository runs `tofu test` automatically on every pull request via [pt-techne-opentofu-workflows](https://github.com/osinfra-io/pt-techne-opentofu-workflows).

