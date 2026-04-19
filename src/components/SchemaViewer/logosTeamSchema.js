const logosTeamSchema = {
  display_name: {
    type: 'string',
    required: true,
    description:
      'Team display name shown in Datadog, GitHub, and the GCP console. Title Case, no special characters except spaces.',
    example: '"Fides"',
  },

  team_type: {
    type: 'string',
    required: true,
    description: 'Team Topologies type. Must match the team key prefix (st-, pt-, ct-, et-).',
    enum: [
      'stream-aligned-team',
      'platform-team',
      'complicated-subsystem-team',
      'enabling-team',
    ],
  },

  datadog_team_memberships: {
    type: 'object',
    required: true,
    description: 'Datadog team membership by role. Use email addresses.',
    properties: {
      admins: {
        type: 'string[]',
        required: true,
        description: 'Can manage team members, settings, and all team resources.',
      },
      members: {
        type: 'string[]',
        required: true,
        description: 'Read-only access to team dashboards and monitors.',
      },
    },
  },

  github_parent_team_memberships: {
    type: 'object',
    required: true,
    description:
      'The main GitHub team. All child teams inherit access from it. Use GitHub usernames.',
    properties: {
      maintainers: {
        type: 'string[]',
        required: true,
        description: 'GitHub usernames with maintainer (admin) role on the team.',
      },
      members: {
        type: 'string[]',
        required: true,
        description: 'GitHub usernames with member role on the team.',
      },
    },
  },

  google_basic_groups_memberships: {
    type: 'object',
    required: true,
    description:
      'Google Cloud Identity groups granting IAM access at the GCP folder level. Use email addresses.',
    properties: {
      admin: {
        type: 'object',
        required: true,
        description: 'Full control over team resources (roles/admin). Can create, delete, and manage IAM.',
        properties: {
          owners: { type: 'string[]', required: true, description: 'Email addresses.' },
          managers: { type: 'string[]', required: true, description: 'Email addresses.' },
          members: { type: 'string[]', required: true, description: 'Email addresses.' },
        },
      },
      reader: {
        type: 'object',
        required: true,
        description: 'Read-only access to team resources (roles/reader).',
        properties: {
          owners: { type: 'string[]', required: true, description: 'Email addresses.' },
          managers: { type: 'string[]', required: true, description: 'Email addresses.' },
          members: { type: 'string[]', required: true, description: 'Email addresses.' },
        },
      },
      writer: {
        type: 'object',
        required: true,
        description: 'Can create and update resources but not manage IAM (roles/writer).',
        properties: {
          owners: { type: 'string[]', required: true, description: 'Email addresses.' },
          managers: { type: 'string[]', required: true, description: 'Email addresses.' },
          members: { type: 'string[]', required: true, description: 'Email addresses.' },
        },
      },
    },
  },

  enable_workflows: {
    type: 'boolean',
    required: false,
    description:
      'Creates a GitHub Actions service account, Workload Identity Federation bindings, and GCP group memberships for CI/CD authentication.',
  },

  enable_opentofu_state_management: {
    type: 'boolean',
    required: false,
    description:
      'Creates an OpenTofu state storage bucket and KMS key IAM bindings. Requires enable_workflows = true.',
  },

  github_child_teams_memberships: {
    type: 'object',
    required: false,
    description:
      'Memberships for the four standard child teams. Teams are always created automatically — include this block only to set members.',
    properties: {
      'sandbox-approvers': {
        type: 'object',
        required: false,
        description: 'Must approve deployments to sandbox environments.',
        properties: {
          maintainers: { type: 'string[]', required: false, description: 'GitHub usernames.' },
          members: { type: 'string[]', required: false, description: 'GitHub usernames.' },
        },
      },
      'non-production-approvers': {
        type: 'object',
        required: false,
        description: 'Must approve deployments to non-production environments.',
        properties: {
          maintainers: { type: 'string[]', required: false, description: 'GitHub usernames.' },
          members: { type: 'string[]', required: false, description: 'GitHub usernames.' },
        },
      },
      'production-approvers': {
        type: 'object',
        required: false,
        description: 'Must approve deployments to production environments.',
        properties: {
          maintainers: { type: 'string[]', required: false, description: 'GitHub usernames.' },
          members: { type: 'string[]', required: false, description: 'GitHub usernames.' },
        },
      },
      'repository-administrators': {
        type: 'object',
        required: false,
        description: 'Can manage repository settings and configurations.',
        properties: {
          maintainers: { type: 'string[]', required: false, description: 'GitHub usernames.' },
          members: { type: 'string[]', required: false, description: 'GitHub usernames.' },
        },
      },
    },
  },

  github_repositories: {
    type: 'map',
    required: false,
    description: 'GitHub repositories owned by this team. Key is the repository name.',
    properties: {
      description: {
        type: 'string',
        required: true,
        description: 'Repository description displayed on the GitHub homepage.',
      },
      topics: {
        type: 'string[]',
        required: true,
        description:
          'Repository topics for categorization. First two must be the team key and team type.',
      },
      enable_datadog_secrets: {
        type: 'boolean',
        required: false,
        description: 'Adds DD_API_KEY and DD_APP_KEY to repository secrets.',
      },
      enable_datadog_webhook: {
        type: 'boolean',
        required: false,
        description: 'Configures a webhook to send repository events to Datadog. Default: true.',
      },
      enable_google_wif_service_account: {
        type: 'boolean',
        required: false,
        description:
          "Allows this repository to authenticate to GCP via OIDC using the team's GitHub Actions service account.",
      },
      enable_ruleset: {
        type: 'boolean',
        required: false,
        description:
          'Enforces linear history, signed commits, pull request reviews, and code owner approval on the default branch. Default: true.',
      },
      pages: {
        type: 'object',
        required: false,
        description: 'GitHub Pages configuration. Omit if this repository does not publish a Pages site.',
        properties: {
          build_type: {
            type: 'string',
            required: false,
            description: 'Deployment mode. Default: "workflow".',
            enum: ['workflow', 'legacy'],
          },
          cname: {
            type: 'string',
            required: false,
            description: 'Custom domain for the Pages site.',
          },
        },
      },
      environments: {
        type: 'map',
        required: false,
        description:
          'GitHub deployment environments with protection rules. Key is the environment identifier.',
        properties: {
          name: {
            type: 'string',
            required: true,
            description: 'Environment display name shown in GitHub.',
          },
          reviewers: {
            type: 'object',
            required: true,
            description: 'Required reviewers before a deployment can proceed.',
            properties: {
              teams: {
                type: 'string[]',
                required: true,
                description: 'GitHub team slugs that must approve deployments.',
              },
            },
          },
          deployment_branch_policy: {
            type: 'object',
            required: false,
            description: 'Controls which branches can trigger deployments.',
            properties: {
              protected_branches: {
                type: 'boolean',
                required: false,
                description: 'Only allow deployments from protected branches.',
              },
              custom_branch_policies: {
                type: 'boolean',
                required: false,
                description: 'Enable custom branch name patterns instead.',
              },
            },
          },
        },
      },
    },
  },

  google_projects: {
    type: 'map',
    required: false,
    description:
      "Additional GCP projects created in the team's environment folder by pt-corpus. Key is the project description slug.",
    properties: {
      services: {
        type: 'string[]',
        required: true,
        description: 'GCP API services to enable (e.g., "bigquery.googleapis.com").',
      },
      enable_datadog: {
        type: 'boolean',
        required: false,
        description: 'Enables Datadog Google Cloud integration for this project.',
      },
    },
  },

  platform_managed_project: {
    type: 'object',
    required: false,
    description:
      'Platform-managed project configuration. Presence of this block drives creation of a shared GCP project in pt-corpus that hosts GKE clusters, managed data services (Cloud SQL, Redis), and other platform workloads. Omit entirely if the team needs neither GKE nor managed data services.',
    properties: {
      enable_datadog: {
        type: 'boolean',
        required: false,
        description: "Enables Datadog Google Cloud integration for the team's platform-managed project. Applies to all workloads in the project — GKE clusters, data services, and other resources.",
      },
      kubernetes_engine: {
        type: 'object',
        required: false,
        description: 'GKE cluster configuration, DNS zones, and Artifact Registry. Omit this block if the team needs only managed data services with no GKE.',
        properties: {
          dns_subdomain: {
            type: 'string',
            required: false,
            description:
              'DNS subdomain for team services. Defaults to the team key with prefix removed. Creates zones: {subdomain}.osinfra.io, {subdomain}.nonprod.osinfra.io, {subdomain}.sb.osinfra.io.',
          },
          artifact_registry_groups_memberships: {
            type: 'object',
            required: false,
            description: 'Container registry access control groups.',
            properties: {
              readers: {
                type: 'object',
                required: false,
                description: 'Can pull container images (roles/artifactregistry.reader).',
                properties: {
                  owners: { type: 'string[]', required: false, description: 'Email addresses.' },
                  managers: { type: 'string[]', required: false, description: 'Email addresses.' },
                  members: { type: 'string[]', required: false, description: 'Email addresses.' },
                },
              },
              writers: {
                type: 'object',
                required: false,
                description: 'Can push container images (roles/artifactregistry.writer).',
                properties: {
                  owners: { type: 'string[]', required: false, description: 'Email addresses.' },
                  managers: { type: 'string[]', required: false, description: 'Email addresses.' },
                  members: { type: 'string[]', required: false, description: 'Email addresses.' },
                },
              },
            },
          },
          locations: {
            type: 'map',
            required: true,
            description:
              'GKE cluster locations keyed by GCP zone (e.g., "us-east1-b"). Only us-east1 and us-east4 zones are supported.',
            properties: {
              enable_gke_hub_host: {
                type: 'boolean',
                required: false,
                description:
                  'Set true for exactly one cluster to act as the fleet host for multi-cluster service discovery and cross-cluster ingress.',
              },
              node_pools: {
                type: 'map',
                required: true,
                description: 'Node pool configurations. At least one pool named "default-pool" must be defined.',
                properties: {
                  machine_type: {
                    type: 'string',
                    required: true,
                    description: 'GCE machine type (e.g., "e2-standard-2").',
                  },
                  min_node_count: {
                    type: 'number',
                    required: true,
                    description: 'Minimum nodes for autoscaling. Can be 0 for cost savings.',
                  },
                  max_node_count: {
                    type: 'number',
                    required: true,
                    description: 'Maximum nodes for autoscaling.',
                  },
                },
              },
              subnet: {
                type: 'object',
                required: true,
                description:
                  "IP ranges for this cluster's VPC subnet. All ranges must be non-overlapping across all teams and environments.",
                properties: {
                  ip_cidr_range: {
                    type: 'string',
                    required: true,
                    description: 'Primary IP range for cluster nodes. Must be /20 or larger.',
                  },
                  master_ipv4_cidr_block: {
                    type: 'string',
                    required: true,
                    description: 'Control plane IP range. Must be /28.',
                  },
                  pod_ip_cidr_range: {
                    type: 'string',
                    required: true,
                    description: 'Secondary IP range for pods. Must be /15 or larger.',
                  },
                  services_ip_cidr_range: {
                    type: 'string',
                    required: true,
                    description: 'Secondary IP range for Kubernetes Services.',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default logosTeamSchema;
