import { useLanguage, type Language } from "@/context/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const handleChange = (value: string) => {
    setLanguage((value as Language) ?? "de");
  };

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger className="w-[130px] rounded-xl">
        <SelectValue placeholder="Sprache" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="de">Deutsch</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
