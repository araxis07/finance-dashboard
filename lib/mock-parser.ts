import type { MockParsedResult } from "@/types/finance";
import type { Language } from "@/types/app";

export function buildMockParsedResult(
  fileName: string,
  language: Language
): MockParsedResult {
  const normalized = fileName.toLowerCase();

  if (normalized.endsWith(".pdf")) {
    return {
      sourceLabel:
        language === "th"
          ? "ตรวจพบเอกสาร statement ธนาคาร"
          : language === "ja"
            ? "銀行明細書を検出"
            : "Bank statement detected",
      confidence: "94%",
      note:
        language === "th"
          ? "จำลองการจับรูปแบบเอกสาร statement และสร้างรายการบรรทัดตัวอย่าง"
          : language === "ja"
            ? "明細書レイアウトを想定してモックの取引行を生成しました"
            : "Matched a statement-style layout and generated mock line items.",
      transactions: [
        {
          date: "2026-03-22",
          title:
            language === "th"
              ? "ค่าเช่าอพาร์ตเมนต์"
              : language === "ja"
                ? "アパート家賃"
                : "Apartment rent",
          amount: 16500,
          type: "expense",
          category: "housing",
          account: "bankAccount",
          paymentMethod: "bankTransfer",
          counterparty:
            language === "th"
              ? "เจ้าของห้อง"
              : language === "ja"
                ? "大家"
                : "Landlord"
        },
        {
          date: "2026-03-20",
          title:
            language === "th"
              ? "ค่าไฟฟ้า"
              : language === "ja"
                ? "電気料金"
                : "Electricity bill",
          amount: 1180,
          type: "expense",
          category: "utilities",
          account: "bankAccount",
          paymentMethod: "autoDebit",
          counterparty:
            language === "th"
              ? "การไฟฟ้า"
              : language === "ja"
                ? "電力会社"
                : "Utility provider"
        },
        {
          date: "2026-03-18",
          title:
            language === "th"
              ? "เงินเดือนเข้า"
              : language === "ja"
                ? "給与入金"
                : "Payroll deposit",
          amount: 42000,
          type: "income",
          category: "salary",
          account: "bankAccount",
          paymentMethod: "bankTransfer",
          counterparty:
            language === "th"
              ? "บริษัทต้นสังกัด"
              : language === "ja"
                ? "勤務先"
                : "Employer"
        }
      ]
    };
  }

  if (normalized.endsWith(".xls") || normalized.endsWith(".xlsx")) {
    return {
      sourceLabel:
        language === "th"
          ? "ตรวจพบไฟล์สเปรดชีต"
          : language === "ja"
            ? "スプレッドシートを検出"
            : "Spreadsheet import detected",
      confidence: "97%",
      note:
        language === "th"
          ? "จำลองการอ่านหัวคอลัมน์และแมปข้อมูลเป็นรายการตัวอย่าง"
          : language === "ja"
            ? "列ヘッダーを認識した想定でモック取引にマッピングしました"
            : "Recognized column headers and mapped values into a transaction preview.",
      transactions: [
        {
          date: "2026-03-21",
          title:
            language === "th"
              ? "รับเงินฟรีแลนซ์"
              : language === "ja"
                ? "フリーランス報酬"
                : "Freelance payout",
          amount: 12000,
          type: "income",
          category: "freelance",
          account: "eWallet",
          paymentMethod: "promptPay",
          counterparty:
            language === "th"
              ? "ลูกค้าโครงการ"
              : language === "ja"
                ? "プロジェクト顧客"
                : "Project client"
        },
        {
          date: "2026-03-19",
          title:
            language === "th"
              ? "ค่าสมาชิกรายเดือน"
              : language === "ja"
                ? "クラウド利用料"
                : "Cloud subscriptions",
          amount: 890,
          type: "expense",
          category: "utilities",
          account: "creditCard",
          paymentMethod: "creditCard",
          counterparty:
            language === "th"
              ? "ผู้ให้บริการซอฟต์แวร์"
              : language === "ja"
                ? "SaaS提供会社"
                : "Software vendor"
        },
        {
          date: "2026-03-17",
          title:
            language === "th"
              ? "เลี้ยงอาหารทีม"
              : language === "ja"
                ? "チームランチ"
                : "Team lunch",
          amount: 520,
          type: "expense",
          category: "dining",
          account: "creditCard",
          paymentMethod: "creditCard",
          counterparty:
            language === "th"
              ? "ร้านอาหาร"
              : language === "ja"
                ? "レストラン"
                : "Restaurant"
        }
      ]
    };
  }

  return {
    sourceLabel:
      language === "th"
        ? "ตรวจพบรูปภาพใบเสร็จ"
        : language === "ja"
          ? "レシート画像を検出"
          : "Receipt image detected",
    confidence: "91%",
    note:
      language === "th"
        ? "จำลองการใช้ OCR เพื่อจัดหมวดจากยอดเงินและชื่อร้านที่มองเห็น"
        : language === "ja"
          ? "OCRを想定して金額と店舗名から分類しました"
          : "Used mocked OCR tags to classify visible amounts and merchant names.",
    transactions: [
      {
        date: "2026-03-23",
        title:
          language === "th"
            ? "ซื้อของเข้าบ้านประจำสัปดาห์"
            : language === "ja"
              ? "週次の食料品購入"
              : "Weekly groceries",
        amount: 1340,
        type: "expense",
        category: "groceries",
        account: "eWallet",
        paymentMethod: "promptPay",
        counterparty:
          language === "th"
            ? "ซูเปอร์มาร์เก็ต"
            : language === "ja"
              ? "スーパーマーケット"
              : "Supermarket"
      },
      {
        date: "2026-03-23",
        title:
          language === "th"
            ? "กาแฟช่วงเช้า"
            : language === "ja"
              ? "朝のコーヒー"
              : "Coffee stop",
        amount: 80,
        type: "expense",
        category: "dining",
        account: "cash",
        paymentMethod: "cash",
        counterparty:
          language === "th"
            ? "คาเฟ่"
            : language === "ja"
              ? "カフェ"
              : "Cafe"
      },
      {
        date: "2026-03-22",
        title:
          language === "th"
            ? "เติมบัตรเดินทาง"
            : language === "ja"
              ? "交通カードのチャージ"
              : "Transit reload",
        amount: 350,
        type: "expense",
        category: "transport",
        account: "eWallet",
        paymentMethod: "promptPay",
        counterparty:
          language === "th"
            ? "ผู้ให้บริการขนส่ง"
            : language === "ja"
              ? "交通事業者"
              : "Transit operator"
      }
    ]
  };
}
