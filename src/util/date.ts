export function getHTMLDatePickerString(date: Date) : string {
    const offset = date.getTimezoneOffset() * 60 * 1000
    const realDate = new Date(date.getTime() - offset);
    const dateString = realDate.toISOString().split('T')[0];

    return dateString
}

export function getLocalDateFromHTMLDatePicker(date: string) : Date {
    const raw = new Date(date)
    const offset = raw.getTimezoneOffset() * 60 * 1000
    return new Date(raw.getTime() + offset);
}

export function getEndOfLocalDay(date: Date) {
    date.setHours(23,59,59,999)
    return date;
}

export function daysBeforeNow(days: number) : Date {
    // + 1 makes it next day
    return new Date(getEndOfLocalDay(new Date()).getTime() - days * 24 * 60 * 60 * 1000 + 1)
}

export function dateFromAPIServer(server : string) {
    const index = server.indexOf(' ')
    if (index !== -1) {
        return server.substring(0, index) + 'T' + server.substring(index + 1)
    }
    return server
}

export function humanReadableDate(date : Date | null) : string {
    if (!date) {
        return ""
    }
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString();

    const str = localISOTime.slice(0, 19).replace("T", " ");
    return "\"" + str + "\""
}
