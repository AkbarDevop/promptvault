'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Copy, Check, Wand2 } from 'lucide-react'

const VAR_REGEX = /\{\{(\s*[\w\s]+\s*)\}\}/g

function parseVariables(content: string): string[] {
  const names = new Set<string>()
  for (const match of content.matchAll(VAR_REGEX)) {
    names.add(match[1].trim())
  }
  return Array.from(names)
}

function substitute(content: string, values: Record<string, string>): string {
  return content.replace(VAR_REGEX, (_, name) => values[name.trim()] || `{{${name.trim()}}}`)
}

export function PromptVariables({ content }: { content: string }) {
  const variables = useMemo(() => parseVariables(content), [content])
  const [values, setValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  if (variables.length === 0) return null

  const result = substitute(content, values)
  const allFilled = variables.every((v) => values[v]?.trim())

  async function handleCopy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">Customize prompt</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {variables.length} variable{variables.length > 1 ? 's' : ''} detected
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {variables.map((variable) => (
          <div key={variable} className="space-y-1">
            <Label htmlFor={`var-${variable}`} className="text-xs font-medium capitalize">
              {variable}
            </Label>
            <Input
              id={`var-${variable}`}
              placeholder={`Enter ${variable}…`}
              value={values[variable] ?? ''}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [variable]: e.target.value }))
              }
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>

      <Button
        size="sm"
        onClick={handleCopy}
        disabled={!allFilled}
        className="w-full sm:w-auto"
      >
        {copied ? (
          <><Check className="mr-1.5 h-3.5 w-3.5 text-green-300" /> Copied!</>
        ) : (
          <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy with values</>
        )}
      </Button>

      {!allFilled && (
        <p className="text-xs text-muted-foreground">Fill in all variables to copy the customized prompt.</p>
      )}
    </div>
  )
}
