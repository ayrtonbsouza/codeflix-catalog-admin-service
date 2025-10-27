set -e

echo "=== Starting DevContainer setup ==="

if [ -e /etc/timezone ]; then
    echo "✓ Timezone already configured: $(cat /etc/timezone)"
else
    echo "• Configuring timezone..."
    ln -fs /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime
    echo "America/Sao_Paulo" > /etc/timezone
    echo "✓ Timezone configured"
fi

echo "• Configuring SSH keys..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh

if [ -d "/ssh-keys" ] && [ -n "$(ls -A /ssh-keys 2>/dev/null)" ]; then
    echo "• Copying SSH keys from host..."
    cp -r /ssh-keys/* ~/.ssh/ 2>/dev/null || true

    find ~/.ssh -type f -name "id_*" ! -name "*.pub" -exec chmod 600 {} \; 2>/dev/null || true
    find ~/.ssh -type f -name "*.pub" -exec chmod 644 {} \; 2>/dev/null || true
    find ~/.ssh -type f -name "known_hosts" -exec chmod 644 {} \; 2>/dev/null || true
    find ~/.ssh -type f -name "config" -exec chmod 600 {} \; 2>/dev/null || true

    if [ -f ~/.ssh/config ]; then
        echo "• Fixing SSH config for Linux..."
        sed -i '/UseKeychain/d' ~/.ssh/config 2>/dev/null || true
        sed -i '/AddKeysToAgent yes/d' ~/.ssh/config 2>/dev/null || true

        if ! grep -q "^Host \*" ~/.ssh/config; then
            cat > ~/.ssh/config.new << 'SSHEOF'
Host *
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/id_rsa
    IdentityFile ~/.ssh/id_ed25519

SSHEOF
            cat ~/.ssh/config >> ~/.ssh/config.new
            mv ~/.ssh/config.new ~/.ssh/config
        fi
    fi

    echo "✓ SSH keys copied and permissions set"
else
    echo "• No SSH keys found in /ssh-keys, using SSH Agent forwarding"
fi

if [ ! -f ~/.ssh/config ] || ! grep -q "^Host" ~/.ssh/config; then
    echo "• Creating SSH config..."
    cat > ~/.ssh/config << 'SSHEOF'
Host *
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/id_rsa
    IdentityFile ~/.ssh/id_ed25519
SSHEOF
    chmod 600 ~/.ssh/config
    echo "✓ SSH config created"
fi

if [ -S /tmp/ssh-agent.sock ]; then
    export SSH_AUTH_SOCK=/tmp/ssh-agent.sock
    echo "• Using SSH agent forwarding from host"
elif [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)" || true
    echo "• Started local SSH agent"
fi

if [ -n "$SSH_AUTH_SOCK" ]; then
    if [ -f ~/.ssh/id_rsa ] && [ "$SSH_AUTH_SOCK" != "/tmp/ssh-agent.sock" ]; then
        ssh-add ~/.ssh/id_rsa 2>/dev/null || true
    fi
    if [ -f ~/.ssh/id_ed25519 ] && [ "$SSH_AUTH_SOCK" != "/tmp/ssh-agent.sock" ]; then
        ssh-add ~/.ssh/id_ed25519 2>/dev/null || true
    fi
fi

echo "✓ SSH configured"

echo "• Configuring Git..."
if [ -f /gitconfig-host ]; then
    echo "• Copying Git config from host..."
    cp /gitconfig-host ~/.gitconfig 2>/dev/null || true
    echo "✓ Git config copied from host"
else
    if [ ! -f ~/.gitconfig ]; then
        echo "• Setting up default Git config..."
        git config --global init.defaultBranch main || true
        git config --global core.editor "code --wait" || true
        echo "✓ Git configured with defaults"
    fi
fi

echo "• Waiting for Oh My Zsh installation..."
while [ ! -d "$HOME/.oh-my-zsh" ]; do
    sleep 1
done
echo "✓ Oh My Zsh found"

echo "• Installing Spaceship theme..."
if [ ! -d "$HOME/.oh-my-zsh/custom/themes/spaceship-prompt" ]; then
    git clone --depth=1 https://github.com/spaceship-prompt/spaceship-prompt.git "$HOME/.oh-my-zsh/custom/themes/spaceship-prompt" || true
    ln -sf "$HOME/.oh-my-zsh/custom/themes/spaceship-prompt/spaceship.zsh-theme" "$HOME/.oh-my-zsh/custom/themes/spaceship.zsh-theme" || true
    echo "✓ Spaceship theme installed"
else
    echo "✓ Spaceship theme already installed"
fi

echo "• Installing Zinit..."
if [ ! -d "$HOME/.local/share/zinit/zinit.git" ]; then
    mkdir -p "$HOME/.local/share/zinit"
    git clone --depth=1 https://github.com/zdharma-continuum/zinit.git "$HOME/.local/share/zinit/zinit.git" || true
    echo "✓ Zinit installed"
else
    echo "✓ Zinit already installed"
fi

echo "• Configuring .zshrc..."
cat > ~/.zshrc << 'EOF'
# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Use Spaceship theme
ZSH_THEME="spaceship"

# Standard oh-my-zsh plugins
plugins=(git)

# Load Oh My Zsh
source $ZSH/oh-my-zsh.sh

# Spaceship theme configuration
SPACESHIP_PROMPT_ORDER=(
  user          # Username section
  dir           # Current directory section
  host          # Hostname section
  git           # Git section (git_branch + git_status)
  hg            # Mercurial section (hg_branch  + hg_status)
  exec_time     # Execution time
  line_sep      # Line break
  vi_mode       # Vi-mode indicator
  jobs          # Background jobs indicator
  exit_code     # Exit code section
  char          # Prompt character
)
SPACESHIP_USER_SHOW=always
SPACESHIP_PROMPT_ADD_NEWLINE=false
SPACESHIP_CHAR_SYMBOL="❯"
SPACESHIP_CHAR_SUFFIX=" "

# Zinit
if [ -d "$HOME/.local/share/zinit/zinit.git" ]; then
    source "$HOME/.local/share/zinit/zinit.git/zinit.zsh"
    autoload -Uz _zinit
    (( ${+_comps} )) && _comps[zinit]=_zinit

    # Zinit plugins
    zinit light zdharma/fast-syntax-highlighting
    zinit light zsh-users/zsh-autosuggestions
    zinit light zsh-users/zsh-completions
fi

# Set PATH
export PATH="$PATH:$HOME/go/bin"

# SSH Agent forwarding
if [ -S /tmp/ssh-agent.sock ]; then
    export SSH_AUTH_SOCK=/tmp/ssh-agent.sock
fi

# User configuration - add your specific settings below
# Add your environment variables and custom aliases here
EOF

echo "✓ .zshrc configured"

echo "• Setting ZSH as default shell..."
ZSH_PATH=$(which zsh)
if [ -n "$ZSH_PATH" ]; then
    echo $ZSH_PATH > ~/.zsh_shell 2>/dev/null || true

    cat > ~/.bash_profile << 'BASHEOF'
# Auto-switch to ZSH
if [ -f "$HOME/.zshrc" ]; then
    export SHELL=$(which zsh)
    exec zsh
fi
BASHEOF

    echo "✓ ZSH configured as default shell"
else
    echo "✗ ZSH not found"
fi

echo ""
echo "=== Setup completed successfully! ==="
echo "ZSH and all plugins are ready to use!"

