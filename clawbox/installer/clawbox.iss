; ClawBox Installer — Inno Setup Script
; 生成 Windows 安装包 clawbox.exe
; 用法: iscc clawbox.iss

#define MyAppName "ClawBox"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Fairy Tail Dev"
#define MyAppURL "http://127.0.0.1:18789"
#define MyAppExeName "clawbox-dashboard.exe"

[Setup]
AppId={{B3A1C9D2-5E4F-4A7D-8C2B-9F1E3D5A7C0B}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={localappdata}\ClawBox
DefaultGroupName=ClawBox
AllowNoIcons=yes
OutputDir=.\output
OutputBaseFilename=clawbox-setup-{#MyAppVersion}
SetupIconFile=.\resources\clawbox.ico
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
; 无需管理员权限（安装到用户目录 + HKCU）
PrivilegesRequired=lowest
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\clawbox.ico
UninstallFilesDir={app}\uninstall
UsedUserAreasWarning=no
LicenseFile=.\resources\eula.txt

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

; ─── Custom Pages ──────────────────────────────────────────────────

[Code]
var
  AgentNamePage: TInputQueryWizardPage;
  WelcomeMsgPage: TInputQueryWizardPage;

procedure InitializeWizard;
begin
  WizardForm.WelcomeLabel1.Caption := '欢迎使用 ClawBox 安装程序';
  WizardForm.WelcomeLabel2.Caption := 'ClawBox 是一款 AI Agent 开发平台，包含白板 Pro 和 AgentForge 插件。' + #13#10 +
    '本程序将安装 Node.js (便携版)、OpenClaw Gateway 及全部插件。';

  // 自定义页 1: Agent 名字
  AgentNamePage := CreateInputQueryPage(
    wpSelectDir,
    'AI Agent 配置',
    '给你的 AI 助手取个名字',
    '请输入你的 AI 助手的名字（之后可以修改）：'
  );
  AgentNamePage.Add('Agent 名字:', False);
  AgentNamePage.Values[0] := 'AI助手';

  // 自定义页 2: 欢迎语
  WelcomeMsgPage := CreateInputQueryPage(
    AgentNamePage.ID,
    '欢迎语设置',
    '设置 AI 助手的第一印象',
    '请输入你的 AI 助手第一次与你对话时的欢迎语：'
  );
  WelcomeMsgPage.Add('欢迎语:', False);
  WelcomeMsgPage.Values[0] := '你好！我是你的 AI 助手';
end;

// 将用户输入保存到临时文件，供安装后脚本使用
procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: String;
  ConfigLines: TArrayOfString;
begin
  if CurStep = ssPostInstall then
  begin
    ConfigFile := ExpandConstant('{app}\config\agent-config.txt');
    SetArrayLength(ConfigLines, 2);
    ConfigLines[0] := 'AGENT_NAME=' + AgentNamePage.Values[0];
    ConfigLines[1] := 'WELCOME_MSG=' + WelcomeMsgPage.Values[0];
    SaveStringsToFile(ConfigFile, ConfigLines, False);
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  OpenClawDir: String;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    // 清理用户数据（OpenClaw 配置和插件）
    if MsgBox('是否同时删除所有用户数据（AI 配置、插件、日志等）？' + #13#10 +
      '如果选择"是"，所有 ClawBox 数据将被完全清除。', mbConfirmation, MB_YESNO) = IDYES then
    begin
      // OpenClaw 配置目录 (~/.openclaw)
      OpenClawDir := ExpandConstant('{%USERPROFILE}\.openclaw');
      if DirExists(OpenClawDir) then
      begin
        DelTree(OpenClawDir, True, True, True);
      end;
    end;
  end;
end;

[Files]
; ─── Node.js 便携版 ───
Source: ".\nodejs\*"; DestDir: "{app}\nodejs"; Flags: ignoreversion recursesubdirs createallsubdirs

; ─── 白板 Pro 插件 ───
Source: "..\plugins\whiteboard\*"; DestDir: "{app}\plugins\whiteboard"; Flags: ignoreversion recursesubdirs createallsubdirs

; ─── AgentForge 插件 (zip 包) ───
Source: "..\plugins\agentforge-v1.0.0.zip"; DestDir: "{app}\plugins"; Flags: ignoreversion

; ─── 安装脚本 ───
Source: "..\scripts\*"; DestDir: "{app}\scripts"; Flags: ignoreversion recursesubdirs createallsubdirs

; ─── 首次引导页 ───
Source: "..\first-run\*"; DestDir: "{app}\first-run"; Flags: ignoreversion recursesubdirs createallsubdirs

; ─── 图标文件 ───
Source: ".\resources\clawbox.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\resources\eula.txt"; DestDir: "{app}"; Flags: ignoreversion

[Dirs]
Name: "{app}\config"
Name: "{app}\logs"
Name: "{app}\data"

[Icons]
Name: "{userprograms}\ClawBox\ClawBox Dashboard"; Filename: "http://127.0.0.1:18789"; IconFilename: "{app}\clawbox.ico"
Name: "{userprograms}\ClawBox\卸载 ClawBox"; Filename: "{uninstallexe}"
Name: "{userdesktop}\ClawBox Dashboard"; Filename: "http://127.0.0.1:18789"; IconFilename: "{app}\clawbox.ico"

[Run]
; 安装后: Node.js 环境下执行安装脚本
; 1. 安装 OpenClaw（显示控制台窗口，方便排查错误）
Filename: "{app}\nodejs\node.exe"; Parameters: "{app}\scripts\install-openclaw.js"; WorkingDir: "{app}"; StatusMsg: "正在安装 OpenClaw Gateway（需要网络）..."; Flags: waituntilterminated
; 2. 安装插件 (解压 agentforge + 配置白板)
Filename: "{app}\nodejs\node.exe"; Parameters: "{app}\scripts\install-plugins.js"; WorkingDir: "{app}"; StatusMsg: "正在安装插件..."; Flags: waituntilterminated
; 3. 首次运行配置
Filename: "{app}\nodejs\node.exe"; Parameters: "{app}\scripts\first-run.js"; WorkingDir: "{app}"; StatusMsg: "正在执行首次启动配置..."; Flags: waituntilterminated
; 4. 启动 ClawBox Dashboard (完成页勾选后执行)
Filename: "{app}\nodejs\node.exe"; Parameters: "-e ""require('child_process').exec('start http://127.0.0.1:18789')"""; WorkingDir: "{app}"; Description: "启动 ClawBox Dashboard"; Flags: postinstall nowait skipifsilent shellexec

[UninstallRun]
; 停止 OpenClaw Gateway
Filename: "{app}\nodejs\npx.cmd"; Parameters: "openclaw gateway stop"; WorkingDir: "{app}"; Flags: runhidden; RunOnceId: "StopGateway"

[UninstallDelete]
Type: filesandordirs; Name: "{app}\*"

[Registry]
; 添加开机自启项 (注册到当前用户的 Run 键)
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "ClawBoxGateway"; ValueData: "{app}\nodejs\node.exe ""{app}\scripts\start-gateway.js"""; Flags: uninsdeletevalue

; 注册 OpenClaw 配置文件路径环境变量
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "CLAWBOX_HOME"; ValueData: "{app}"; Flags: uninsdeletevalue

[Messages]
BeveledLabel=ClawBox Installer v{#MyAppVersion}
SetupAppTitle=ClawBox 安装程序
SetupWindowTitle=ClawBox 安装程序 - {#MyAppVersion}
