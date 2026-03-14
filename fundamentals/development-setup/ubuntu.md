---
description: >-
  Use the Ubuntu distribution as an Infrastructure as Code (IaC) sandbox
  development environment.
---

# Ubuntu

<figure><img src="../../.gitbook/assets/ubuntu.png" alt=""><figcaption></figcaption></figure>

## Install

You can run the following commands to install all the local tools we need.

This is optional but will allow for `sudo` access without entering a password.

```bash
echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo EDITOR='tee -a' visudo
```

This script is in the [pt-techne-development-setup](https://github.com/osinfra-io/pt-techne-development-setup) repo.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/osinfra-io/pt-techne-development-setup/main/ubuntu/setup.sh)"
```

Change your default shell to Zsh exit and restart.

```bash
chsh -s /home/linuxbrew/.linuxbrew/bin/zsh; exit
```

When you start the terminal, you will be prompted to set up [Powerlevel10k](https://github.com/romkatv/powerlevel10k). Choose the options you like and go!

Once complete, you can stay current by running the generated update script.

```bash
~/bin/update.sh
```
