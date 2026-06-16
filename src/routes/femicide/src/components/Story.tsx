const Lady = "/icons/afro-curly.svg";
import Quote from "./Quote";
import LineScrolly from "./Scrolly/LineChartScrolly";
import TemporalScrolly from "./Scrolly/TemporalScrolly";

export const LadyProfile = () => {
  return (
    <div className='flex-1 w-full'>
      <div className='md:min-h-120 w-full h-[60vh] md:w-[70%] mx-auto relative'>
        <div className='papers absolute inset-0 bg-white w-full min-h-96 h-full shadow-md z-30 p-6'>
          <div className='flex flex-col gap-8 justify-between items-center h-full w-full'>
            <sub className='text-xs text-center tracking-widest uppercase text-gray-400 font-semibold'>
              VICTIM - Rebecca Cheptegei
            </sub>
            <div className='text-center grid gap-2'>
              <img
                src={Lady}
                alt='afro lady icon'
                className='block mx-auto mb-4'
              />
              <p>
                <strong>Name:</strong> REBECCA CHEPTEGAI
              </p>
              <p>
                <strong>Age:</strong> 33yrs
              </p>
              <p>
                <strong>County:</strong> Eldoret
              </p>
              <p>
                <strong>Relationship to perpetrator:</strong> Ex-boyfriend
              </p>
              <p>
                <strong>Date of Death:</strong> September 2024
              </p>
              <p>
                <strong>Status:</strong> Case reported, no prior action taken
              </p>
            </div>

            <sub className='self-end text-gray-400 tracking-widest'>
              001/979
            </sub>
          </div>
        </div>
        <div className='papers absolute inset-0 bg-white w-full min-h-96 h-full shadow-md rotate-2 z-20'></div>
        <div className='papers absolute inset-0 bg-white w-full min-h-96 h-full shadow-md -rotate-1 z-10'></div>
      </div>
    </div>
  );
};

export default function Story() {
  return (
    <div className=' min-h-screen flex flex-col items-center justify-center p-6 gap-6'>
      <div className='flex-1 grid gap-10 p-2 md:w-[60%] mx-auto'>
        {/* <h2 className='font-bold text-center titlecase font-headline md:text-h1 text-xl text-primary-red'>
          Not an Outlier
        </h2> */}

        <p className=' text-lg'>
          Rebecca Cheptegei, an Olympic athlete, died at the age of 33  after
          her ex-boyfriend ambushed her on her way back from church. He then
          doused her in petrol and set her on fire. Before this tragic incident,
          the couple had been in conflict over the piece of land in which
          Rebecca resided. Further accounts from her brother show that Rebecca
          was harassed by her ex-boyfriend over money issues, with him stating
          that the ex-boyfriend once asked her, “What do you do with all the
          money you make?"
          <br /> <br />
          The athlete's family said that they had reported the ex-boyfriend to
          authorities over harassment, but no action had been taken until the
          incident that led to her death. Rebecca was not the first. In 2021,
          Agnes Tirop, a world record holder, was stabbed to death by her
          partner. Six months later, Damaris Mutua, another athlete, was
          strangled by her partner.
        </p>
        <LadyProfile />
        <p>
          Rebecca's, Tirop’s and Damaris’ stories are unfortunately not outliers
          but a harsh reality that many Kenyan women face at the hands of those
          closest to them.
          <br /> <br />
          The way women are treated usually tells a lot about society. Valerie
          M. Hudson, a political science professor, advances a theory she calls
          the “First Predictor” Theory. The level of violence against women is
          one of the strongest indicators of a state’s overall peacefulness.
          When women are unsafe in their homes and communities, it often signals
          deeper institutional breakdowns that can escalate into broader
          political and social violence. 
        </p>

        <Quote
          text='When a society normalises violence and oppression between men and women, the two halves of humanity, whether in households or communities, will feel adverse effects nationally'
          author='― Valerie M. Hudson'
        />
        <p>
          Thus, femicide presents a deeper cultural issue in Kenya. There is a
          continuous lax attitude around gender based violence, with many
          believing that they should not concern themselves with matters of
          family and love. This attitude is not seen only in a regular citizen,
          but also in law enforcement officers. When a woman’s life and
          well-being are not valued, she is not only collateral damage to an
          existing flawed system but is also treated as a shock absorber of
          life’s challenges. 
          <br /> <br />
          The femicide data collected by Africa Data Hub makes this pattern
          visible, showing a correlation between periods of national political
          turbulence and spikes in femicide and gender based violence cases. 
        </p>
      </div>
      <LineScrolly />
      <div className='flex-1 grid gap-10 p-2 md:w-[60%] mx-auto'>
        <p>
          The year 2018 was marked by the fallout from the contested 2017
          elections, which led to many political demonstrations and unrest in
          Kenya. That year recorded the second-highest peak of femicide cases
          with 106 deaths.  The year 2024 was also marked by the ‘GenZ protests’
          over hard economic times and a proposed unforgiving financial bill.
          That year also saw the highest femicide cases with 131  deaths
          reported. 
          <br /> <br />
          More alarming was 2025, when, during the anniversary ‘GenZ protests’ 
          that saw many women come out to protest against the political
          situation, it turned gruesome and at least fourteen women were raped.
          With eleven of those rape cases involving a gang rape by 3 to 11 men.
          It then points to a deeper cultural signalling when women and men
          protest against the government injustices together, and at night, the
          very same men turn against the women.
        </p>
        <Quote
          text='To my daughter I will say, when the men come, set yourself on fire.'
          author='― Warsan Shire, Teaching My Mother How to Give Birth'
        />
        <p>
          The reality is that between the ages of 15 and 59, at the prime of her
          life, a woman is most likely to be killed by a man close to her, a
          boyfriend or husband, rather than a stranger. Still, all women are at
          risk, with the data showing the youngest victim of femicide being a
          3-year-old girl and the oldest being a 95-year-old grandma. 
        </p>
        <p>
          Which then raises the question of what can be done to curtail and stop
          these killings.
          <br /> <br />
          The data shows that the common perpetrators are found at home and that
          these killings also often happen at home. With the crime scene being
          at home, where life runs cyclically, then surely there can be patterns
          to these murders. And if there are patterns, then the government,
          advocates, law enforcement and community can rise to circumvent these
          killings.
          <br /> <br />
          Even in the ordinariness of life, women are always at risk. Weekends
          are generally seen as chaotic and high-risk; alcohol, parties, and
          socialisation are a breeding ground for violence as people destress
          from the week. On those days, violence is almost a given, with most
          people being on guard. However, Monday, which mostly represents a
          return to normalcy and life hustles,  is just as dangerous, with many
          femicide deaths occurring then. January, after festivities and with
          new year preparations, also shows the highest month with femicide
          deaths.
          <br /> <br />
        </p>
      </div>
      <TemporalScrolly />
      <div className='flex-1 grid gap-10 p-2 md:w-[60%] mx-auto'>
        <p>
          In the extremeness and ordinariness, we see that femicide in Kenya
          isn't random; it follows a pattern. This allows us to identify windows
          where intervention and police presence could be most effective.
          Patterns can be interpreted. More police patrols. More funding for
          safe houses. Advocacy timed to when women are most at risk.  We do not
          need to fully understand something to act against it.
          <br /> <br />
          Rebecca made the news because she was an Olympian. Many women in this
          data did not. What they shared with her was not athletic promise but
          the ordinary fact of being a woman in Kenya, close to a man who
          believed her life was his to take. The data shows us when. The data
          shows us who. What it cannot show us is why we keep letting it happen.
        </p>
      </div>
    </div>
  );
}
