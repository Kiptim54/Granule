export default function Methodology() {
  return (
    <div className='container md:w-1/2 mx-auto flex flex-col gap-6 p-6'>
      <h3 className='text-4xl text-primary-red font-semibold text-left'>
        Methodology
      </h3>
      <p className='text-lg'>
        <b>Data Source</b>
        <br />
        <br />
        This analysis draws from the Africa Data Hub&apos;s Femicide Kenya
        Database; a collaborative tracking effort by Africa Uncensored, Odipo
        Dev, and Africa Data Hub to systematically document femicide cases in
        Kenya. The data was web scraped directly from{" "}
        <a
          href='https://www.africadatahub.org/femicide-kenya-database'
          target='_blank'
          rel='noopener noreferrer'
          className='underline text-primary-red hover:opacity-75 break-all'
        >
          africadatahub.org/femicide-kenya-database
        </a>
        .
        <br />
        <br />
        <b>Data Structure</b>
        <br />
        <br />
        The dataset consists of <b>979 records</b> capturing reported femicide
        cases in Kenya between 2005 and 2025, with the following fields:
      </p>
      <ul className='list-disc list-inside text-lg flex flex-col gap-2'>
        <li>
          <b>Numerical/Temporal:</b> Age of the victim; Day, Month, and Year of
          the incident; numeric day-of-week representation (0&ndash;6)
        </li>
        <li>
          <b>Categorical:</b> Location (county or town); Suspect Relationship
          (e.g., Husband, Boyfriend, Stranger); Week Type (Weekday or Weekend);
          Month Period (Start, Mid, or End of month)
        </li>
        <li>
          <b>Metadata:</b> Victim name; full date of murder
        </li>
      </ul>
      <p className='text-lg'>
        <b>Data Cleaning</b>
      </p>
      <ul className='list-disc list-inside text-lg flex flex-col gap-2'>
        <li>
          <b>Missing Values:</b> Erroneous rows where most or all fields were
          null were dropped. The dataset contained{" "}
          <b>513 missing values in the Age field</b> (recorded as &quot;Not
          available&quot; or &quot;Unknown&quot;). Rather than removing these
          records, they were retained; their presence is itself significant,
          reflecting the systematic gaps in how femicide is reported and
          investigated in Kenya.
        </li>
        <li>
          <b>Normalization:</b> Suspect relationship categories were
          standardised to ensure accurate grouping. For example, merging
          inconsistent entries like &quot;Family Member&quot; and &quot;family
          member&quot; into a single category.
        </li>
        <li>
          <b>Dropped Fields:</b> The <code>image_url</code> column was removed
          as it does not contribute to the statistical analysis of trends.
        </li>
      </ul>
      <p className='text-lg'>
        <i>
          A note on undercounting: the 979 cases in this dataset represent only
          those deaths that were reported, documented, and captured by civil
          society tracking efforts. The true number is almost certainly higher.
        </i>
      </p>
    </div>
  );
}
