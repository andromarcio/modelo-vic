# ============================================================================
# Tema "VIC CAIXA" para SharePoint Online (paleta institucional)
# ----------------------------------------------------------------------------
# Registra o tema no tenant para que os proprietários de site possam aplicá-lo
# em "Configurações (engrenagem) > Alterar a aparência > Tema".
#
# Pré-requisitos:
#   - SharePoint Online Management Shell:  Install-Module Microsoft.Online.SharePoint.PowerShell
#   - Perfil de Administrador do SharePoint
#
# Execução:
#   Connect-SPOService -Url https://SEU-TENANT-admin.sharepoint.com
#   .\vic-caixa-theme.ps1
# ============================================================================

$palette = @{
  # --- Cores de tema (azul institucional CAIXA) ---
  "themePrimary"        = "#005ca9";
  "themeLighterAlt"     = "#f3f8fd";
  "themeLighter"        = "#e5f2fc";
  "themeLight"          = "#c0def5";
  "themeTertiary"       = "#6cb0e4";
  "themeSecondary"      = "#1a74bd";
  "themeDarkAlt"        = "#00538f";
  "themeDark"           = "#00437a";
  "themeDarker"         = "#003259";

  # --- Neutros (cinzas frios + tinta CAIXA) ---
  "neutralLighterAlt"   = "#f7fafa";
  "neutralLighter"      = "#f0f2f2";
  "neutralLight"        = "#e3ebeb";
  "neutralQuaternaryAlt"= "#d8e3e6";
  "neutralQuaternary"   = "#d0e0e3";
  "neutralTertiaryAlt"  = "#c2d2d6";
  "neutralTertiary"     = "#9eb2b8";
  "neutralSecondary"    = "#525f66";
  "neutralPrimaryAlt"   = "#2f3940";
  "neutralPrimary"      = "#22292e";
  "neutralDark"         = "#161b1f";
  "black"               = "#000000";
  "white"               = "#ffffff";

  # --- Superfície / texto ---
  "bodyBackground"      = "#ffffff";
  "bodyText"            = "#22292e";
  "primaryBackground"   = "#ffffff";
  "primaryText"         = "#22292e";
}

Add-SPOTheme -Identity "VIC CAIXA" -Palette $palette -IsInverted $false -Overwrite
Write-Host "Tema 'VIC CAIXA' registrado. Aplique no site em: Engrenagem > Alterar a aparencia > Tema." -ForegroundColor Green

# ============================================================================
# Cor de destaque (laranja CAIXA #F39200) NÃO é um slot de tema do SharePoint.
# Use-a manualmente em botões/Chamada para ação e nas ilustrações (já vêm com ela).
# ============================================================================

# ----------------------------------------------------------------------------
# Alternativa com PnP PowerShell (aplica direto em um site específico):
#   Connect-PnPOnline -Url https://SEU-TENANT.sharepoint.com/sites/VIC -Interactive
#   Set-PnPWebTheme -Theme "VIC CAIXA"
# ----------------------------------------------------------------------------
