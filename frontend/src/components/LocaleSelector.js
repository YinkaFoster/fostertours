import { useLocale } from '../context/LocaleContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Globe, DollarSign, Check } from 'lucide-react';

const LocaleSelector = ({ variant = 'default' }) => {
  const { 
    currency, setCurrency, currencies,
    language, setLanguage, languages,
    t
  } = useLocale();

  const isCompact = variant === 'compact';

  return (
    <div className="flex items-center gap-1">
      {/* Currency Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size={isCompact ? "sm" : "icon"}
            className={isCompact ? "h-8 px-2 text-xs" : "h-9 w-9"}
          >
            {isCompact ? (
              <span className="font-medium">{currencies[currency]?.symbol}</span>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                <span className="sr-only">{t('currency')}</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{t('currency')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(currencies).map(([code, info]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setCurrency(code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="font-medium w-6">{info.symbol}</span>
                <span>{code}</span>
                <span className="text-muted-foreground text-xs">- {info.name}</span>
              </span>
              {currency === code && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size={isCompact ? "sm" : "icon"}
            className={isCompact ? "h-8 px-2 text-xs" : "h-9 w-9"}
          >
            {isCompact ? (
              <span>{languages[language]?.flag}</span>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                <span className="sr-only">{t('language')}</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(languages).map(([code, info]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setLanguage(code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{info.flag}</span>
                <span>{info.nativeName}</span>
              </span>
              {language === code && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LocaleSelector;
