export const authTemplate = `<mjml>
<mj-body background-color="#fafafa">
    <mj-section background-color="white">
        <mj-column>
            <mj-image width="100px" src="<%=logo%>"></mj-image>
            <mj-divider border-color="<%=accent%>" border-width="2px"></mj-divider>
            <mj-text font-size="14px" align="center" color="#171717" font-family="helvetica"><%=intro%></mj-text>
            <mj-text font-size="14px" align="center" color="#171717" font-family="helvetica"><%=message%></mj-text>
            <mj-divider border-color="<%=accent%>" border-width="2px"></mj-divider>
            <mj-text font-size="20px" color="<%=accent%>" font-family="helvetica" align="center"><%=code%></mj-text>
        </mj-column>
    </mj-section>
</mj-body>
</mjml>`;