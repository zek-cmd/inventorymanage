<?php
$escape = function ($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
};
$displayDate = function ($date) {
    return date('F j, Y', strtotime($date));
};
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Requisition Request Report</title>
    <style>
        @page { size: letter portrait; margin: 0.55in 0.55in 0.6in; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #111827; font-family: Arial, sans-serif; background: #f3f4f6; }
        .toolbar { padding: 16px; text-align: center; }
        .print-button { border: 0; border-radius: 6px; background: #17365d; color: #fff; cursor: pointer; font-size: 14px; font-weight: 700; padding: 10px 18px; }
        .report { background: #fff; margin: 0 auto 24px; max-width: 8.5in; min-height: 10in; padding: 0.3in 0.18in 0.6in; }
        .school-header { display: block; height: auto; margin: 0 auto 10px; max-width: 100%; width: 6.3in; }
        h1 { font-size: 18pt; margin: 8px 0 3px; text-align: center; }
        .date-range { font-size: 10.5pt; font-style: italic; margin: 0 0 18px; text-align: center; }
        table { border-collapse: collapse; font-size: 9.5pt; table-layout: fixed; width: 100%; }
        th, td { border: 1px solid #d9d9d9; overflow-wrap: break-word; padding: 9px 10px; vertical-align: middle; }
        th { background: #17365d; color: #fff; font-size: 9pt; text-align: center; }
        tbody tr:nth-child(odd) { background: #f4f7fa; }
        .requestor { width: 20%; }
        .date { width: 18%; }
        .items { width: 31%; }
        .note { width: 31%; }
        .empty { padding: 18px; text-align: center; }
        .prepared-by { font-size: 10.5pt; margin-top: 34px; }
        .prepared-by strong { display: block; margin-bottom: 6px; }
        @media print {
            body { background: #fff; }
            .toolbar { display: none; }
            .report { margin: 0; max-width: none; min-height: 0; padding: 0; }
            th {
    background: #ffffff !important;
    color: #111827 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
            thead { display: table-header-group; }
            tr { break-inside: avoid; page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <button class="print-button" type="button" onclick="window.print()">Print or Save as PDF</button>
    </div>
    <main class="report">
        <img class="school-header" src="/assets/images/softnet-report-header.png" alt="SOFTNET Information Technology Center">
        <h1>REQUISITION REPORT</h1>
        <p class="date-range"><?= !empty($isSelectedReport) ? 'Selected requisitions' : 'Requests dated ' . $escape($displayDate($fromDate)) . ' to ' . $escape($displayDate($toDate)) ?></p>

        <table>
            <thead>
                <tr>
                    <th class="requestor">Name</th>
                    <th class="date">Date</th>
                    <th class="items">Items Requested</th>
                    <th class="note">Purpose</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($requisitions)): ?>
                    <tr><td class="empty" colspan="4">No requisitions were recorded within the selected date range.</td></tr>
                <?php else: ?>
                    <?php foreach ($requisitions as $requisition): ?>
                        <tr>
                            <td><?= $escape($requisition['name']) ?></td>
                            <td><?= $escape($displayDate($requisition['date'])) ?></td>
                            <td><?= $escape($requisition['item_summary']) ?></td>
                            <td><?= $escape($requisition['note'] ?: '-') ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>

        <div class="prepared-by">
            <strong>Prepared By:</strong>
            <span><?= $escape($preparedBy) ?></span>
        </div>
    </main>
</body>
</html>
