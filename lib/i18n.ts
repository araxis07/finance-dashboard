import type { Language } from "@/types/app";

export const languageOptions: Array<{
  id: Language;
  shortLabel: string;
  nativeLabel: string;
}> = [
  { id: "th", shortLabel: "TH", nativeLabel: "ไทย" },
  { id: "en", shortLabel: "EN", nativeLabel: "English" },
  { id: "ja", shortLabel: "JA", nativeLabel: "日本語" }
];

const localeMap: Record<Language, string> = {
  th: "th-TH-u-ca-gregory",
  en: "en-US",
  ja: "ja-JP"
};

const translations = {
  th: {
    shell: {
      brandName: "Finora",
      brandTitle: "การเงินส่วนบุคคล",
      brandDescription:
        "แดชบอร์ดแบบ local-first สำหรับดูยอดคงเหลือ แนวโน้มรายจ่าย และบันทึกรายการได้อย่างละเอียด",
      workspaceLabel: "พื้นที่ทำงานการเงินส่วนบุคคล",
      localStateTitle: "ข้อมูลอยู่ในเครื่อง",
      localStateDescription:
        "ธุรกรรมและค่ากำหนดถูกเก็บไว้ในเครื่อง และไฟล์จะถูกตรวจสอบก่อนนำเข้า",
      addTransaction: "เพิ่มรายการ",
      loadSample: "โหลดข้อมูลตัวอย่าง",
      language: "ภาษา",
      theme: "ธีม",
      lightMode: "สว่าง",
      darkMode: "มืด"
    },
    pages: {
      dashboard: {
        title: "แดชบอร์ด",
        description: "ติดตามยอดคงเหลือ หมวดรายจ่าย และรายการล่าสุดของคุณ"
      },
      upload: {
        title: "อัปโหลด",
        description: "อัปโหลดไฟล์เพื่อแปลง ตรวจสอบ และนำเข้ารายการธุรกรรม"
      }
    },
    nav: {
      dashboard: "แดชบอร์ด",
      upload: "อัปโหลด"
    },
    summary: {
      badge: "ภาพรวมกระเป๋าเงิน",
      totalBalance: "ยอดคงเหลือรวม",
      description:
        "ติดตามกระแสเงินเข้า เงินออก และภาพรวมฐานะการเงินของคุณในสกุลเงินบาท",
      income: "รายรับ",
      expense: "รายจ่าย"
    },
    chart: {
      title: "รายจ่ายตามหมวดหมู่",
      description: "ดูสัดส่วนการใช้จ่ายตามหมวดที่บันทึกไว้",
      totalSpent: "รวมที่ใช้ไป",
      emptyTitle: "ยังไม่มีข้อมูลรายจ่าย",
      emptyDescription:
        "เพิ่มรายการรายจ่ายอย่างน้อยหนึ่งรายการเพื่อให้กราฟแสดงการกระจายค่าใช้จ่าย",
      addExpense: "เพิ่มรายจ่าย",
      loadSample: "ใช้ข้อมูลตัวอย่าง",
      centerLabel: "รายจ่าย",
      category: "หมวดหมู่"
    },
    recent: {
      title: "รายการล่าสุด",
      description:
        "แสดงรายการรายรับและรายจ่ายล่าสุดพร้อมรายละเอียดประกอบ",
      emptyTitle: "ยังไม่มีรายการธุรกรรม",
      emptyDescription:
        "เพิ่มรายการแรกเพื่อเริ่มติดตามยอดคงเหลือ รายจ่าย และกิจกรรมล่าสุด",
      createTransaction: "สร้างรายการ",
      loadSample: "โหลดรายการตัวอย่าง",
      sourceCounterparty: "คู่รายการ",
      sourceLocation: "สถานที่",
      sourceReference: "อ้างอิง",
      sourceNote: "บันทึก",
      sourceTags: "แท็ก"
    },
    dashboardPanel: {
      badge: "จังหวะการเงินรายสัปดาห์",
      title: "บันทึกให้เร็วและละเอียด",
      description:
        "กรอกข้อมูลให้ครบทั้งบัญชี วิธีจ่าย คู่รายการ และแท็ก เพื่อให้การตามรอยรายรับรายจ่ายแม่นยำขึ้น",
      cleanTitle: "หน้าตาสไตล์ฟินเทค",
      cleanDescription:
        "ใช้การ์ดขอบโค้ง เงานุ่ม และแอนิเมชันเบา ๆ เพื่อให้อ่านข้อมูลง่าย",
      localTitle: "ทำงานแบบ local-first",
      localDescription:
        "ธุรกรรม ภาษา และการแสดงผลทั้งหมดทำงานในฝั่ง client โดยไม่พึ่ง backend"
    },
    modal: {
      badge: "บันทึกด่วน",
      title: "เพิ่มรายการธุรกรรม",
      description:
        "บันทึกรายรับหรือรายจ่ายพร้อมรายละเอียดเชิงลึก เช่น บัญชี วิธีชำระเงิน คู่รายการ หมายเหตุ และแท็ก",
      currencyHint: "ค่าเริ่มต้นของระบบคือเงินบาท (THB)",
      primarySection: "ข้อมูลหลัก",
      detailsSection: "รายละเอียดเพิ่มเติม",
      transactionTitle: "ชื่อรายการ",
      amount: "จำนวนเงิน",
      type: "ประเภทรายการ",
      category: "หมวดหมู่",
      date: "วันที่",
      account: "บัญชี",
      paymentMethod: "วิธีชำระเงิน",
      counterparty: "ผู้รับเงิน / แหล่งที่มา",
      location: "สถานที่",
      reference: "เลขอ้างอิง",
      note: "บันทึกเพิ่มเติม",
      tags: "แท็ก",
      tagsHint: "คั่นหลายแท็กด้วย comma",
      placeholders: {
        title: "เช่น ค่าเช่าห้องเดือนมีนาคม",
        amount: "0.00",
        counterparty: "เช่น เจ้าของห้อง, บริษัท, ร้านค้า",
        location: "เช่น กรุงเทพฯ, ออนไลน์, สาขาอโศก",
        reference: "เช่น INV-2026-0315",
        note: "ระบุรายละเอียดเพิ่มเติมที่อยากจำไว้",
        tags: "เช่น fixed-cost, family, work"
      },
      validation: {
        titleRequired: "กรุณากรอกชื่อรายการ",
        amountRequired: "กรุณากรอกจำนวนเงินมากกว่า 0"
      },
      cancel: "ยกเลิก",
      save: "บันทึกรายการ"
    },
    upload: {
      title: "อัปโหลดแบบลากวาง",
      description:
        "รองรับ PDF, Excel, CSV และรูปภาพ พร้อมตรวจสอบไฟล์และพรีวิวผลก่อนนำเข้า",
      dropTitle: "อัปโหลด statement หรือ receipt",
      dropDescription:
        "ลากไฟล์มาวางเพื่ออ่านข้อมูล ตรวจสอบคอลัมน์ และเตรียมนำเข้าธุรกรรม",
      chooseFile: "เลือกไฟล์",
      sample: "ใช้ตัวอย่าง",
      previewTitle: "ตัวอย่างผลแปลงข้อมูล",
      previewDescription:
        "แสดงตัวอย่างว่าข้อมูลที่ดึงออกมาอาจถูกจัดวางอย่างไรก่อนนำเข้า",
      emptyTitle: "ยังไม่มีไฟล์อัปโหลด",
      emptyDescription:
        "ลากไฟล์เข้ามาเพื่อดูพรีวิวรายการที่พร้อมนำเข้า",
      confidence: "ความมั่นใจ",
      mockResult: "ผลจำลอง",
      detailLine: "รายละเอียดที่ระบบจำลองอ่านได้"
    },
    toast: {
      title: "บันทึกรายการสำเร็จ",
      description: (title: string, category: string) =>
        `รายการ "${title}" ถูกบันทึกไว้ในหมวด ${category}`
    }
  },
  en: {
    shell: {
      brandName: "Finora",
      brandTitle: "Personal finance",
      brandDescription:
        "A local-first dashboard for balances, spending trends, and richly detailed transaction capture",
      workspaceLabel: "Personal finance workspace",
      localStateTitle: "Local-only state",
      localStateDescription:
        "Transactions and preferences stay on this device, and uploads are validated before import",
      addTransaction: "Add transaction",
      loadSample: "Load sample data",
      language: "Language",
      theme: "Theme",
      lightMode: "Light",
      darkMode: "Dark"
    },
    pages: {
      dashboard: {
        title: "Dashboard",
        description: "Track balances, spending categories, and recent activity"
      },
      upload: {
        title: "Upload",
        description: "Upload a file to validate, parse, and import transactions"
      }
    },
    nav: {
      dashboard: "Dashboard",
      upload: "Upload"
    },
    summary: {
      badge: "Portfolio snapshot",
      totalBalance: "Total balance",
      description:
        "Keep an eye on inflows, outflows, and your overall financial position in Thai baht",
      income: "Income",
      expense: "Expense"
    },
    chart: {
      title: "Expense by category",
      description: "See how your spending is distributed across categories",
      totalSpent: "Total spent",
      emptyTitle: "No expense data yet",
      emptyDescription:
        "Add at least one expense transaction to populate the spending chart",
      addExpense: "Add expense",
      loadSample: "Use sample data",
      centerLabel: "Expenses",
      category: "Category"
    },
    recent: {
      title: "Recent transactions",
      description:
        "Review the latest income and expense entries with richer details",
      emptyTitle: "No transactions recorded",
      emptyDescription:
        "Add your first transaction to start tracking balances, spending, and activity",
      createTransaction: "Create transaction",
      loadSample: "Load sample transactions",
      sourceCounterparty: "Counterparty",
      sourceLocation: "Location",
      sourceReference: "Reference",
      sourceNote: "Note",
      sourceTags: "Tags"
    },
    dashboardPanel: {
      badge: "Weekly rhythm",
      title: "Capture fast, capture deep",
      description:
        "Record account, payment method, counterparty, notes, and tags so your money trail stays precise",
      cleanTitle: "Clean fintech design",
      cleanDescription:
        "Rounded cards, soft shadows, and light motion keep the dashboard readable",
      localTitle: "Local-first architecture",
      localDescription:
        "Transactions, language, and presentation all run client-side without a backend"
    },
    modal: {
      badge: "Quick add",
      title: "Add transaction",
      description:
        "Capture income or expense entries with detailed fields such as account, payment method, counterparty, notes, and tags",
      currencyHint: "Thai baht (THB) is the default currency throughout the app",
      primarySection: "Core details",
      detailsSection: "More context",
      transactionTitle: "Transaction title",
      amount: "Amount",
      type: "Type",
      category: "Category",
      date: "Date",
      account: "Account",
      paymentMethod: "Payment method",
      counterparty: "Counterparty / Source",
      location: "Location",
      reference: "Reference number",
      note: "Notes",
      tags: "Tags",
      tagsHint: "Separate multiple tags with commas",
      placeholders: {
        title: "e.g. March apartment rent",
        amount: "0.00",
        counterparty: "e.g. landlord, employer, merchant",
        location: "e.g. Bangkok, online, Asok branch",
        reference: "e.g. INV-2026-0315",
        note: "Add anything you want to remember about this entry",
        tags: "e.g. fixed-cost, family, work"
      },
      validation: {
        titleRequired: "Please enter a transaction title",
        amountRequired: "Please enter an amount greater than 0"
      },
      cancel: "Cancel",
      save: "Save transaction"
    },
    upload: {
      title: "Drag and drop upload",
      description:
        "Accepts PDF, Excel, CSV, and image files with validation and import preview",
      dropTitle: "Upload a statement or receipt",
      dropDescription:
        "Drop a file to inspect columns, validate entries, and prepare transactions for import",
      chooseFile: "Choose file",
      sample: "Use sample",
      previewTitle: "Mock parsed preview",
      previewDescription:
        "Shows how extracted fields could be presented before import",
      emptyTitle: "Nothing uploaded yet",
      emptyDescription:
        "Drop a file to generate an import preview and review detected transactions",
      confidence: "Confidence",
      mockResult: "Mock result",
      detailLine: "Detailed fields identified by the mocked parser"
    },
    toast: {
      title: "Transaction saved",
      description: (title: string, category: string) =>
        `"${title}" was saved under ${category}`
    }
  },
  ja: {
    shell: {
      brandName: "Finora",
      brandTitle: "個人ファイナンス",
      brandDescription:
        "残高、支出傾向、詳細な取引記録をローカルで管理するダッシュボード",
      workspaceLabel: "個人ファイナンスワークスペース",
      localStateTitle: "ローカル保存のみ",
      localStateDescription:
        "取引と設定は端末内に保持され、アップロードファイルは取り込み前に検証されます",
      addTransaction: "取引を追加",
      loadSample: "サンプルデータ",
      language: "言語",
      theme: "テーマ",
      lightMode: "ライト",
      darkMode: "ダーク"
    },
    pages: {
      dashboard: {
        title: "ダッシュボード",
        description: "残高、支出カテゴリ、最近の取引を追跡します"
      },
      upload: {
        title: "アップロード",
        description: "ファイルをアップロードして検証し、取引として取り込みます"
      }
    },
    nav: {
      dashboard: "ダッシュボード",
      upload: "アップロード"
    },
    summary: {
      badge: "資産スナップショット",
      totalBalance: "総残高",
      description:
        "タイバーツ建てで入金、出金、全体の資金状況をまとめて確認できます",
      income: "収入",
      expense: "支出"
    },
    chart: {
      title: "カテゴリ別支出",
      description: "記録済み支出の内訳をカテゴリごとに確認します",
      totalSpent: "支出合計",
      emptyTitle: "支出データがまだありません",
      emptyDescription:
        "支出取引を少なくとも1件追加するとグラフが表示されます",
      addExpense: "支出を追加",
      loadSample: "サンプルを表示",
      centerLabel: "支出",
      category: "カテゴリ"
    },
    recent: {
      title: "最近の取引",
      description: "最新の収入・支出を詳細付きで確認できます",
      emptyTitle: "取引がまだありません",
      emptyDescription:
        "最初の取引を追加して残高、支出、アクティビティの追跡を始めましょう",
      createTransaction: "取引を作成",
      loadSample: "サンプル取引を追加",
      sourceCounterparty: "相手先",
      sourceLocation: "場所",
      sourceReference: "参照番号",
      sourceNote: "メモ",
      sourceTags: "タグ"
    },
    dashboardPanel: {
      badge: "週間ファイナンスリズム",
      title: "素早く、かつ詳細に記録",
      description:
        "口座、支払方法、相手先、メモ、タグまで記録しておくと支出の追跡精度が上がります",
      cleanTitle: "クリーンなフィンテックUI",
      cleanDescription:
        "丸みのあるカード、柔らかい影、控えめな動きで読みやすさを保ちます",
      localTitle: "ローカルファースト構成",
      localDescription:
        "取引、言語、表示ロジックはすべてクライアント側で動作し、バックエンドは使いません"
    },
    modal: {
      badge: "クイック追加",
      title: "取引を追加",
      description:
        "口座、支払方法、相手先、メモ、タグなどを含む詳細な収入・支出記録を追加できます",
      currencyHint: "アプリ全体のデフォルト通貨はタイバーツ (THB) です",
      primarySection: "基本情報",
      detailsSection: "追加情報",
      transactionTitle: "取引名",
      amount: "金額",
      type: "種類",
      category: "カテゴリ",
      date: "日付",
      account: "口座",
      paymentMethod: "支払方法",
      counterparty: "相手先 / 入金元",
      location: "場所",
      reference: "参照番号",
      note: "メモ",
      tags: "タグ",
      tagsHint: "複数タグはカンマで区切ってください",
      placeholders: {
        title: "例: 3月の家賃",
        amount: "0.00",
        counterparty: "例: 大家、会社、店舗",
        location: "例: バンコク、オンライン、アソーク支店",
        reference: "例: INV-2026-0315",
        note: "この取引について残しておきたい内容",
        tags: "例: fixed-cost, family, work"
      },
      validation: {
        titleRequired: "取引名を入力してください",
        amountRequired: "0より大きい金額を入力してください"
      },
      cancel: "キャンセル",
      save: "保存"
    },
    upload: {
      title: "ドラッグ＆ドロップアップロード",
      description:
        "PDF、Excel、CSV、画像に対応し、取り込み前に内容を確認できます",
      dropTitle: "明細書またはレシートをアップロード",
      dropDescription:
        "ファイルをドロップすると列の検出と検証を行い、取り込み前の結果を確認できます",
      chooseFile: "ファイルを選択",
      sample: "サンプルを使う",
      previewTitle: "モック解析プレビュー",
      previewDescription:
        "取り込み前に抽出フィールドがどのように表示されるかを確認できます",
      emptyTitle: "まだアップロードされていません",
      emptyDescription:
        "ファイルをドロップして、取り込み前の取引プレビューを表示します",
      confidence: "信頼度",
      mockResult: "モック結果",
      detailLine: "モックパーサーが認識した詳細フィールド"
    },
    toast: {
      title: "取引を保存しました",
      description: (title: string, category: string) =>
        `「${title}」を ${category} として保存しました`
    }
  }
} as const;

type TranslationTree = (typeof translations)["th"];
type TranslationValue =
  | string
  | ((...args: any[]) => string)
  | {
      [key: string]: TranslationValue;
    };

function isTranslationBranch(value: TranslationValue): value is Record<string, TranslationValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeTranslations<T extends TranslationValue>(
  fallback: T,
  candidate: TranslationValue | undefined
): T {
  if (!isTranslationBranch(fallback)) {
    return (candidate ?? fallback) as T;
  }

  const mergedEntries = Object.keys(fallback).reduce<Record<string, TranslationValue>>(
    (accumulator, key) => {
      const fallbackValue = fallback[key];
      const candidateValue =
        candidate && isTranslationBranch(candidate) ? candidate[key] : undefined;

      accumulator[key] = mergeTranslations(
        fallbackValue,
        candidateValue as TranslationValue | undefined
      );
      return accumulator;
    },
    {}
  );

  return mergedEntries as T;
}

const resolvedTranslations: Record<Language, TranslationTree> = {
  th: translations.th,
  en: mergeTranslations(translations.th, translations.en),
  ja: mergeTranslations(translations.th, translations.ja)
};

export function getTranslation(language: Language) {
  return resolvedTranslations[language] ?? resolvedTranslations.th;
}

export function getLocale(language: Language) {
  return localeMap[language] ?? localeMap.th;
}
