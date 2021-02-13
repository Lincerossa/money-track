import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react'
import XLSX from 'xlsx'
import ReactDataSheet from 'react-datasheet'
import 'react-datasheet/lib/react-datasheet.css'

type BUCKET = {label: string, keywords: string[], value: number}

const BUCKETS = [
  {
    label: 'spesa',
    keywords: ['LEADER', 'iperal', 'crai', 'UNES'],
    value: 0,
  },
  {
    label: 'shopping',
    keywords: ['AMZ'],
    value: 0,
  },
  {
    label: 'famiglia',
    keywords: ['LANZA'],
    value: 0,
  },

  {
    label: 'protein',
    keywords: ['MYPROTEIN'],
    value: 0,
  },
  {
    label: 'udemy',
    keywords: ['UDEMY'],
    value: 0,
  },
  {
    label: 'other',
    keywords: [],
    value: 0,
  },
]

const App = () => {
  const [sheet, setSheet] = useState<any>(null)
  const [buckets, setBuckets] = useState<BUCKET[] | null>(BUCKETS)
  const myInput = useRef() as React.MutableRefObject<HTMLInputElement>

  const handleChange = useCallback(() => {
    const f = myInput.current?.files?.[0]

    if (f) {
      const r = new FileReader()
      r.onload = (e) => {
        const contents = processExcel(e?.target?.result)
        setSheet(contents)
      }
      r.readAsBinaryString(f)
    } else {
      // eslint-disable-next-line no-console
      console.log('Failed to load file')
    }
  }, [setSheet, myInput])

  const processExcel = (data: any) => {
    const workbook = XLSX.read(data, {
      type: 'binary',
    })

    return toTuple(workbook)
  }

  const toTuple = (workbook: any) => {
    let json: any = null
    workbook.SheetNames.forEach((sheetName: any) => {
      json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      })
    })
    return json?.map((row: any) => {
      if (row.length < 2) return null
      const result = row

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < row.length; i++) {
        result[i] = row[i] || 0
      }
      return result
    }).filter((x: any) => x)
  }

  useEffect(() => {
    if (!sheet?.length) return

    const result : BUCKET[] = sheet.reduce((acc: BUCKET[], val: any) => {
      const [,, output, , fullDescription] = val
      const bucketIndex = acc
        .findIndex((b:any) => b.keywords.find((k:any) => fullDescription.indexOf(k) > -1))

      if (bucketIndex > -1) {
        return [
          ...acc.slice(0, bucketIndex),
          {
            ...acc[bucketIndex],
            value: Number(Number(acc[bucketIndex].value) + Number(output)),
          },
          ...acc.slice(bucketIndex + 1),
        ]
      }

      return [
        ...acc.slice(0, -1),
        {
          ...acc[acc.length - 1],
          value: Number(Number(acc[acc.length - 1].value) + Number(output)) || 0,
        },
      ]
    }, BUCKETS)

    setBuckets(result)
  }, [sheet, setBuckets])

  // eslint-disable-next-line no-console
  console.log({ buckets })
  return (
    <>
      <input ref={myInput} type="file" accept=".xlsx" onChange={handleChange} />
      {buckets?.map((bucket: any) => (
        <div>
          {bucket.label}
          :
          {bucket.value}
        </div>
      ))}
      {sheet && (
        <ReactDataSheet
          data={sheet}
          valueRenderer={(value: any) => value}
        />
      )}
    </>
  )
}

export default App
