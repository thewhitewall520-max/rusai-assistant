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
;Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

; ─── Custom Pages ──────────────────────────────────────────────────

[Code]
var
  ThemePage: TWizardPage;
  ThemeRadioGroup: TNewRadioGroup;
  CustomNamesPage: TInputQueryWizardPage;
  AgentNamePage: TInputQueryWizardPage;
  WelcomeMsgPage: TInputQueryWizardPage;
  SelectedTheme: String;

const
  THEMES: array [0..4] of String = ('fairytail', 'onepiece', 'naruto', 'demon-slayer', 'custom');
  THEME_LABELS: array [0..4] of String = (
    '🐉 妖精尾巴（默认）— 纳兹·多拉格尼尔 & 妖精尾巴公会',
    '☠️ 海贼王 — 蒙奇·D·路飞 & 草帽海贼团',
    '🍥 火影忍者 — 漩涡鸣人 & 木叶隐村',
    '⚡ 鬼灭之刃 — 灶门炭治郎 & 鬼杀队',
    '✏️ 自定义 — 我来自定义 Agent 的名字！'
  );

// 主题选择回调：更新 SelectedTheme 变量
procedure OnThemeSelect(Sender: Object);
begin
  SelectedTheme := THEMES[ThemeRadioGroup.ItemIndex];
end;

// 检查当前页是否应该显示
function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;
  // 如果没选择"自定义"，跳过自定义名字页
  if (PageID = CustomNamesPage.ID) and (SelectedTheme <> 'custom') then
    Result := True;
end;

procedure InitializeWizard;
var
  I: Integer;
begin
  WizardForm.WelcomeLabel1.Caption := '欢迎使用 ClawBox 安装程序';
  WizardForm.WelcomeLabel2.Caption := 'ClawBox 是一款 AI Agent 开发平台，包含白板 Pro 和 AgentForge 插件。' + #13#10 +
    '本程序将安装 Node.js (便携版)、OpenClaw Gateway 及全部插件。';

  // ── 自定义页 1: 主题选择 ──
  ThemePage := CreateCustomPage(
    wpSelectDir,
    'AgentForge 主题选择',
    '选择你的 AI 团队风格'
  );

  ThemeRadioGroup := TNewRadioGroup.Create(ThemePage);
  ThemeRadioGroup.Top := 8;
  ThemeRadioGroup.Left := 8;
  ThemeRadioGroup.Width := ThemePage.SurfaceWidth - 16;
  ThemeRadioGroup.Height := ThemePage.SurfaceHeight - 16;
  ThemeRadioGroup.Parent := ThemePage.Surface;

  for I := 0 to 4 do
  begin
    ThemeRadioGroup.Items.Add(THEME_LABELS[I]);
  end;
  ThemeRadioGroup.ItemIndex := 0; // 默认选择妖精尾巴
  SelectedTheme := 'fairytail';

  // 监听主题选择变化
  ThemeRadioGroup.OnClick := @OnThemeSelect;

  // ── 自定义页 2: 自定义 Agent 名字（仅当选择"自定义"时显示） ──
  CustomNamesPage := CreateInputQueryPage(
    ThemePage.ID,
    '自定义 Agent 名字',
    '为你的 5 个 AI Agent 分别取名',
    '请输入 5 个 Agent 的名字：'
  );
  CustomNamesPage.Add('Agent 1 (开发):', False);
  CustomNamesPage.Add('Agent 2 (测试):', False);
  CustomNamesPage.Add('Agent 3 (验收):', False);
  CustomNamesPage.Add('Agent 4 (安全审查):', False);
  CustomNamesPage.Add('Agent 5 (部署):', False);
  CustomNamesPage.Values[0] := 'Agent 1';
  CustomNamesPage.Values[1] := 'Agent 2';
  CustomNamesPage.Values[2] := 'Agent 3';
  CustomNamesPage.Values[3] := 'Agent 4';
  CustomNamesPage.Values[4] := 'Agent 5';

  // ── 自定义页 3: Agent 名字（老大/用户名） ──
  AgentNamePage := CreateInputQueryPage(
    CustomNamesPage.ID,
    'AI 团队配置',
    '给你的 AI 助手团队起个名',
    '你是团队的"老大"，你的 AI 团队听命于你。请输入你的称呼：'
  );
  AgentNamePage.Add('你的名字:', False);
  AgentNamePage.Values[0] := '老大';

  // ── 自定义页 4: 欢迎语 ──
  WelcomeMsgPage := CreateInputQueryPage(
    AgentNamePage.ID,
    '欢迎语设置',
    '设置 AI 助手的第一印象',
    '请输入你的 AI 团队第一次与你对话时的欢迎语：'
  );
  WelcomeMsgPage.Add('欢迎语:', False);
  WelcomeMsgPage.Values[0] := '你好！我是你的 AI 助手团队';
end;

// 将用户输入保存到临时文件，供安装后脚本使用
procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: String;
  ConfigLines: TArrayOfString;
  CustomNamesStr: String;
  I: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    ConfigFile := ExpandConstant('{app}\config\agent-config.txt');

    // 如果是自定义主题，拼接 5 个名字
    if SelectedTheme = 'custom' then
    begin
      CustomNamesStr := '';
      for I := 0 to 4 do
      begin
        if I > 0 then
          CustomNamesStr := CustomNamesStr + ',';
        CustomNamesStr := CustomNamesStr + CustomNamesPage.Values[I];
      end;
    end;

    SetArrayLength(ConfigLines, 4);
    ConfigLines[0] := 'AGENT_NAME=' + AgentNamePage.Values[0];
    ConfigLines[1] := 'WELCOME_MSG=' + WelcomeMsgPage.Values[0];
    ConfigLines[2] := 'THEME=' + SelectedTheme;
    if SelectedTheme = 'custom' then
      ConfigLines[3] := 'CUSTOM_NAMES=' + CustomNamesStr
    else
      ConfigLines[3] := 'CUSTOM_NAMES=';

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

; ─── 主题模板 ───
Source: ".\resources\themes\*"; DestDir: "{app}\themes"; Flags: ignoreversion recursesubdirs createallsubdirs

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
; 0. 生成 Agent 配置（基于选中的主题）
Filename: "{app}\nodejs\node.exe"; Parameters: """{app}\scripts\generate-agent-config.js"" --config ""{app}\config\agent-config.txt"" --output ""{app}\config"""; WorkingDir: "{app}"; StatusMsg: "正在生成 AI 团队配置..."; Flags: waituntilterminated
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
