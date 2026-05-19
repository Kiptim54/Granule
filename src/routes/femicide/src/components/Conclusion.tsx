export default function Conclusion() {
  return (
    <div className='container md:w-1/2 mx-auto flex flex-col   gap-6 p-6'>
      <h3 className='text-4xl text-primary-red font-semibold text-center'>
        Recommendations
      </h3>
      <p className='text-lg'>
        <b>Violence is not random. The patterns are clear.</b>
        <br /> <br />
        For twenty years, the data has shown us when and how women in Kenya are
        most at risk. Femicide follows the rhythms of domestic life; the end of
        the week, the start of the month, the turn of the year.
        <br /> <br />
        Governments and policy makers have the information they need. What
        remains is the will to act on it:
        <br />
        <ul className='list-disc list-inside'>
          <li>
            Targeted Resource Allocation Violence peaks at predictable times.
            Staffing should reflect that. Law enforcement and emergency response
            services should increase capacity during identified high-risk
            windows — not just weekends, but through Monday. The data shows that
            danger does not end when the weekend does.
          </li>
          <li>
            Seasonal Intervention The worst months are preceded by warning
            months. January and July are peak months for femicide. That means
            December and June are the intervention windows. Public awareness
            campaigns, increased access to domestic violence support, and
            proactive outreach should intensify before the peak — not during it.
          </li>
        </ul>
      </p>
    </div>
  );
}
